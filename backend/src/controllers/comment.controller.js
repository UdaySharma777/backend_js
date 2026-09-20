import mongoose, { Aggregate } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const commentsAggregate = Comment.aggregate([
        {
            $match: {
                Video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    { $project: { username: 1, fullName: 1, avatar: 1 } }
                ]
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" }
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ])

    const options = {
        page: Number(page),
        limit: Number(limit)
    }

    const comments = await Comment.aggregatePaginate(commentsAggregate, options)

    return res.status(200).json(
        new ApiResponse(200, comments, "Comments fetched successfully")
    )
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
   const {content} = req.body
   const {videoId} =req.params

   if (!content?.trim()){
    throw new ApiError(400, 'Comment content is required')
   }
   const comment = await Comment.create({
    content,
    Video: videoId,
    owner: req.user._id
   })

   if(!comment){
    throw new ApiError (500, "something went wrong while adding comment")
   }

   return res.status(200).json(
    new ApiResponse(200, comment, "Comment added Successfullly")
   )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params

    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404, "No Comment found")
    }
    if(comment.owner.toString() !== req.user._id.toString()){
        throw new ApiError (403, "you can not update someone else's comment")
    }

    const {content} = req.body
    if(!content?.trim()){
        throw new ApiError(400, "New commnet required")
    }

    comment.content = content
    await comment.save()
    return res.status(200).json(new ApiResponse(200, {}, "Commnet updated"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404, "No Comment found")
    }
    if(comment.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You cannot delte someone else's comment")
    }

    await comment.deleteOne()
    return res.status(200).json( new ApiResponse(200, {}, "Comment delted Successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }