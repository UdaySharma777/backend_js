import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    if (!(name && description)){
        throw new ApiError(400, "Playlist name and description is required")
    }
    const playlists = await Playlist.create({
        name,
        description,
        owner:req.user._id,
        videos: [] 
    })
    return res.status(200).json(new ApiResponse(200, playlists,"Playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const playlists = await Playlist.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(req.user. _id)
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200, playlists,"plaaylist fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id")
    }

    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
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
                        $addFields: { owner: { $first: "$owner" } }
                    }
                ]
            }
        }
    ])

    if (!playlist?.length) {
        throw new ApiError(404, "Playlist not found")
    }

    return res.status(200).json(new ApiResponse(200, playlist[0], "playlist fetched successfully from playlist id"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    if(!playlistId){
        throw new ApiError(400, "playlist doesn't exit")
    }
    if(!videoId){
        throw new ApiError(400, "video doesn't exit")
    }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to modify this playlist")
    } 
    playlist.videos.push(videoId)
    await playlist.save()
    return res.status(200).json(new ApiResponse(200, playlist,"Video added succeefully to the playlist"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!playlistId){
        throw new ApiError(400, "playlist doesn't exit")
    }
    if(!videoId){
        throw new ApiError(400, "video doesn't exit")
    }
    const playlist = await Playlist.findById(playlistId)  
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to modify this playlist")
    }          
    playlist.videos.pull(videoId)
    await playlist.save()
    return res.status(200).json(new ApiResponse(200, playlist,"vedio removed sucessfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!playlistId){
        throw new ApiError(400, "playlist doesn't exit")
    }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to modify this playlist")
    }
    await playlist.deleteOne()
    return res.status(200).json(new ApiResponse(200, "Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    
    if (!playlistId){
        throw new ApiError(400, "Playlist not found")
    }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to modify this playlist")
    }
    playlist.name = name
    playlist.description = description
    await playlist.save()
    return res.status(200).json(new ApiResponse(200, playlist,"Playlist updated successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}