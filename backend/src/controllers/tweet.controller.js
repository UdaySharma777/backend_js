import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body

    if(!content){
        throw new ApiError(400, "All fields are required")
    }
    const tweet = await Tweet.create({
        content,
        owner:req.user._id
    })
    return res.status(200).json(new ApiResponse(200, tweet, "Tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params

    if(!userId){
        throw new ApiError(400, "userId not found")
    }
    const tweets = await Tweet.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(userId)
            }
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
                        fullName:1,
                        username:1,
                        avatar:1
                        }
                    }
                ]
            }
        },
        {
            $project: {
                content: 1,
                owner: 1,
                createdAt: 1
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200, tweets, "tweets fetched successfully" ))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {content} = req.body
    if (!tweetId){
        throw new ApiError(400, "tweet does not exist")
    }
    if (!content?.trim()) {
        throw new ApiError(400, "Tweet content is required")
    }
    const tweet =await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }
    if (tweet.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "you cannot edit someone else;s tweet")
    }
    tweet.content = content
    await tweet.save()
    return res.status(200).json(new ApiResponse(200, tweet,"Tweet Updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404, "co tweet found")
    }
    if(tweet.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "you cannot delete someone else's comment")
    }
    await tweet.deleteOne()
    res.status(200).json(new ApiResponse(200, "Tweet deleted succcessfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}