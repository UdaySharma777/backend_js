import axiosInstance from "./axiosInstance"

export const createPlaylist = async ({ name, description }) => {
    const response = await axiosInstance.post("/playlists", { name, description })
    return response.data
}

export const getUserPlaylists = async () => {
    const response = await axiosInstance.get("/playlists/userPlaylists")
    return response.data
}

export const getPlaylistById = async (playlistId) => {
    const response = await axiosInstance.get(`/playlists/${playlistId}`)
    return response.data
}

export const updatePlaylist = async (playlistId, { name, description }) => {
    const response = await axiosInstance.patch(`/playlists/${playlistId}`, { name, description })
    return response.data
}

export const deletePlaylist = async (playlistId) => {
    const response = await axiosInstance.delete(`/playlists/${playlistId}`)
    return response.data
}

export const addVideoToPlaylist = async (videoId, playlistId) => {
    const response = await axiosInstance.patch(`/playlists/add/${videoId}/${playlistId}`)
    return response.data
}

export const removeVideoFromPlaylist = async (videoId, playlistId) => {
    const response = await axiosInstance.patch(`/playlists/remove/${videoId}/${playlistId}`)
    return response.data
}