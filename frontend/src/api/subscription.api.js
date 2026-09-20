import axiosInstance from "./axiosInstance"

export const toggleSubscription = async (channelId) => {
    const response = await axiosInstance.post(`/subscriptions/channel/${channelId}`)
    return response.data
}