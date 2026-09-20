import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res) => {

    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const userId = req.user._id
    if (!userId) {
        throw new ApiError(400, "channel not found")
    }
    const stats = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "videos._id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                totalVideos: {
                    $size: "$videos"
                },
                totalSubscribers: {
                    $size: "$subscribers"
                },
                totalLikes: {
                    $size: "$likes"
                },
                totalViews: {
                    $sum: "$videos.views"
                }
            }
        },
        {
            $project: {
                totalVideos: 1,
                totalSubscribers: 1,
                totalLikes: 1,
                totalViews: 1
            }
        }
    ])
    return res.status(200).json(
        new ApiResponse(
            200,
            stats[0],
            "Channel stats fetched successfully"
        )
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id
    if (!userId) {
        throw new ApiError(400, "user not found")
    }

    const result = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos"
            }
        },
        {
            $project: {
                videos: 1,
                _id: 0
            }
        }
    ])

    const videos = result[0]?.videos || []

    return res.status(200).json(new ApiResponse(200, videos, "videos fetched successfully"))
})

export {
    getChannelStats, 
    getChannelVideos
    }