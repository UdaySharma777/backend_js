import axiosInstance from "./axiosInstance"

export const getAllVideos = async ({ page = 1, limit = 10, query, sortBy, sortType, userId } = {}) => {
    const params = { page, limit }
    if (query) params.query = query
    if (sortBy) params.sortBy = sortBy
    if (sortType) params.sortType = sortType
    if (userId) params.userId = userId

    const response = await axiosInstance.get("/videos", { params })
    return response.data
}

export const getVideoById = async (videoId) => {
    const response = await axiosInstance.get(`/videos/${videoId}`)
    return response.data
}

export const publishAVideo = async (formData, onUploadProgress) => {
    const response = await axiosInstance.post("/videos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress,
    })
    return response.data
}

export const updateVideo = async (videoId, formData) => {
    const response = await axiosInstance.patch(`/videos/${videoId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data
}

export const deleteVideo = async (videoId) => {
    const response = await axiosInstance.delete(`/videos/${videoId}`)
    return response.data
}

export const togglePublishStatus = async (videoId) => {
    const response = await axiosInstance.patch(`/videos/toggle/publish/${videoId}`)
    return response.data
}