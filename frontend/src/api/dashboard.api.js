import axiosInstance from "./axiosInstance"

// Note: these are POST in your backend routes, not GET, despite being read operations
export const getChannelStats = async () => {
    const response = await axiosInstance.post("/dashboard/stats")
    return response.data
}

export const getChannelVideos = async () => {
    const response = await axiosInstance.post("/dashboard/videos")
    return response.data
}