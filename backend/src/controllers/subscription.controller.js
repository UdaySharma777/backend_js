import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if (!channelId){
        throw new ApiError(400, "no channel found")
    }
    const subscribe = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })
    if(subscribe){
        await subscribe.deleteOne()
        return res.status(200).json(new ApiResponse(200, {},"Unsubscribed channel"))
    }
    else{
        await Subscription.create({
            channel: channelId,
            subscriber: req.user._id
        })
    }
    return res.status(200).json(new ApiResponse(200, {},"Subscribed to channel"))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if (!channelId){
        throw new ApiError(400, "no channel found")
    }
    const subscribers = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(channelId)
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
                from: "users",
                localField: "subscribers.user",
                foreignField: "_id",
                as: "subsciberdetails"
            }
        },
        {
            $project: {
                subsciberdetails: 1
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200, subscribers, "subscribers fetched successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!subscriberId){
        throw new ApiError(400, "subscriber not found")
    }
    const subscribedChannels = await User.aggregate([
        {
            $lookup: new mongoose.Types.ObjectId(subscriberId)
        },
        {
            $lookup:{
                from: "subscrptions",
                localField: "_id",
                foreignField: "users",
                as: "subscriptions"
            }
        },
        {
            $lookup:{
                from: "users",
                foreignField: "subscriptions.channel",
                localField: "_id",
                as: "subscribedChannels"
            }
        },
        {
            $project: {
                subscribedChannels: 1
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200, subscribers, "subscribed channels fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}