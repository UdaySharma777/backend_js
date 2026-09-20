import axiosInstance from "./axiosInstance"

export const toggleVideoLike = async (videoId) => {
    const response = await axiosInstance.post(`/likes/video/${videoId}`)
    return response.data
}