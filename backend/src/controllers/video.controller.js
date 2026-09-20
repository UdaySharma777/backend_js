import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const matchStage = {
    isPublished: true
    }

    if (query) {
        matchStage.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ]
    }
    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid userId")
        }
        matchStage.owner = new mongoose.Types.ObjectId(userId)
    }
    const sortStage = {}
    if (sortBy && sortType) {
        sortStage[sortBy] = sortType === "asc" ? 1 : -1
    } else {
        sortStage.createdAt = -1
    }
    const aggregate = Video.aggregate([
        {
            $match: matchStage
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $sort: sortStage
        }
    ])

    const options = {
        page: Number(page),
        limit: Number(limit)
    }   
    const videos = await Video.aggregatePaginate(aggregate, options)
    return res.status(200).json(new ApiResponse(200, videos, "videos fetched successfully"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    if (!(title && description)){
        throw new ApiError(400, "both fields are required")
    }
    const videoPath = req.files?.videoFile[0]?.path
    if (!videoPath){
        throw new ApiError(400, "video file is required")
    }

    const thumbnailpath = req.files?.thumbnail[0]?.path
    if(!thumbnailpath){
        throw new ApiError(400, "thumbnail required")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailpath)
    const uploadeVideo= await uploadOnCloudinary(videoPath)
    const publishedVideo = await Video.create({
        title,
        description,
        videoFile: uploadeVideo.url,
        thumbnail: thumbnail.url,
        duration: uploadeVideo.duration,
        owner:req.user._id,

    })

    return res.status(200).json(new ApiResponse(200, publishedVideo,"Vedio published successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        // owner info
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" }
            }
        },
        // likes
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                isLiked: {
                    $cond: {
                        if: { $in: [new mongoose.Types.ObjectId(req.user._id), "$likes.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                likes: 0 // don't send the raw likes array to the frontend, just the count/flag
            }
        }
    ])

    if (!video?.length) {
        throw new ApiError(404, "Video not found")
    }

    const fetchedVideo = video[0]

    // increment view count
    await Video.findByIdAndUpdate(videoId, {
        $inc: { views: 1 }
    })

    // add to viewer's watch history (avoid duplicate entries piling up)
    await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { watchHistory: videoId }
    })

    return res.status(200).json(
        new ApiResponse(200, fetchedVideo, "Video fetched successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    if(!videoId){
        throw new ApiError(400, "Video not found")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400, "Video not found")
    }
    if (video.owner.toString()!==req.user._id.toString()){
        throw new ApiError(400, "you cant make changes in this video")
    }
    const {title, description}=req.body
    if(!(title && description)){
        throw new ApiError(400, "both title and description are required")
    }
    video.title = title,
    video.description = description
    const thumbnailPath = req.file?.path
    if (!thumbnailPath){
        throw new ApiError(400, "thumbnail required to complete update")
    }
    const thumbnail = await uploadOnCloudinary(thumbnailPath)
    if (!thumbnail){
        throw new ApiError(400, "thumbnail upload fail")
    }
    video.thumbnail =thumbnail.url
    await video.save()
    return res.status(200).json(new ApiResponse(200,video, "Video Updated successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!videoId){
        throw new ApiError(400, "video not found")
    }
    const video = await Video.findById(videoId)
    if (!video){
        throw new ApiError(400, "Video not found")
    }
    if (video.owner.toString()!==req.user._id.toString()){
        throw new ApiError(403,"you are not allowed to delete this video")
    }

    await Video.findByIdAndDelete(videoId)
    return res.status(200).json(new ApiResponse(200, {},"video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId){
        throw new ApiError(400, "video not found")
    }
    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "video not found")
    }
    if(video.owner.toString()!==req.user._id.toString()){
        throw new ApiError(403,"You are not allowed to change video status")
    }
    video.isPublished = !video.isPublished
    await video.save()
    return res.status(200).json(new ApiResponse(200, video, "publish status activated successfully"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}