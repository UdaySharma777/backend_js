import axiosInstance from "./axiosInstance"

export const getUserChannelProfile = async (username) => {
    const response = await axiosInstance.get(`/users/c/${username}`)
    return response.data
}

export const getWatchHistory = async () => {
    const response = await axiosInstance.get("/users/watchHistory")
    return response.data
}