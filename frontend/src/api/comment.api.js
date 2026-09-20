import axiosInstance from "./axiosInstance"

export const getVideoComments = async (videoId) => {
    const response = await axiosInstance.get(`/comments/${videoId}`)
    return response.data
}

export const addComment = async (videoId, content) => {
    const response = await axiosInstance.post(`/comments/${videoId}`, { content })
    return response.data
}

export const updateComment = async (commentId, content) => {
    const response = await axiosInstance.patch(`/comments/c/${commentId}`, { content })
    return response.data
}

export const deleteComment = async (commentId) => {
    const response = await axiosInstance.delete(`/comments/c/${commentId}`)
    return response.data
}