import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "Video not found")
    }
    const like = await Like.findOne({
        likedBy: req.user._id,
        video: videoId
    })
    if (like) {
        await like.deleteOne()
        return res.status(200).json(new ApiResponse(200, {}, "Like Removed Successfully"))
    } else {
        await Like.create({
            video: videoId,
            likedBy: req.user._id
        })
        return res.status(200).json(new ApiResponse(200, {}, "You Liked the Video"))
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if (!commentId) {
        throw new ApiError(400, "Comment not found")
    }
    const like = await Like.findOne({
        likedBy: req.user._id,
        comment: commentId
    })
    if (like) {
        await like.deleteOne()
        return res.status(200).json(new ApiResponse(200, {}, "Comment like Removed"))
    } else {
        await Like.create({
            comment: commentId,
            likedBy: req.user._id
        })
        return res.status(200).json(new ApiResponse(200, {}, "You liked the comment"))
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    if (!tweetId) {
        throw new ApiError(400, "Tweet not found")
    }
    const like = await Like.findOne({
        likedBy: req.user._id,
        tweet: tweetId
    })
    if (like) {
        await like.deleteOne()
        return res.status(200).json(new ApiResponse(200, {}, "tweet Like removed"))
    } else {
        await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        })
        return res.status(200).json(new ApiResponse(200, {}, "You Liked the tweet"))
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "likedBy",
                as: "likedVideos"
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "likedVideos.video",
                foreignField: "_id",
                as: "likedVideos"
            }
        }
    ])

    return res.status(200).json (new ApiResponse(200, user[0]?.likedVideos || [] ,"Liked videos fetched successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}