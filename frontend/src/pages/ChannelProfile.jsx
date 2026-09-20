import { useState, useEffect, useCallback } from "react"
import { useParams } from "react-router-dom"
import { getUserChannelProfile } from "../api/user.api"
import { getAllVideos } from "../api/video.api"
import { toggleSubscription } from "../api/subscription.api"
import { useAuth } from "../context/AuthContext"
import VideoCard from "../components/video/VideoCard"

const ChannelProfile = () => {
    const { username } = useParams()
    const { user: loggedInUser } = useAuth()
    const [channel, setChannel] = useState(null)
    const [videos, setVideos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [subLoading, setSubLoading] = useState(false)

    const fetchChannel = useCallback(async () => {
        try {
            const res = await getUserChannelProfile(username)
            setChannel(res.data)
            return res.data
        } catch (err) {
            setError(err.response?.data?.message || "Channel not found")
            return null
        }
    }, [username])

    const fetchChannelVideos = useCallback(async (channelId) => {
        try {
            const res = await getAllVideos({ userId: channelId, limit: 20 })
            setVideos(res.data.docs)
        } catch (err) {
            console.error("Failed to load channel videos", err)
        }
    }, [])

    useEffect(() => {
        setLoading(true)
        fetchChannel().then((channelData) => {
            if (channelData?._id) {
                fetchChannelVideos(channelData._id)
            }
            setLoading(false)
        })
    }, [fetchChannel, fetchChannelVideos])

    const handleSubscribe = async () => {
        if (!channel?._id || subLoading) return
        setSubLoading(true)
        try {
            await toggleSubscription(channel._id)
            // re-fetch to get the updated subscriber count + isSubscribed flag
            await fetchChannel()
        } catch (err) {
            console.error("Failed to toggle subscription", err)
        } finally {
            setSubLoading(false)
        }
    }

    if (loading) return <div className="loading-state">Loading...</div>
    if (error) return <div className="error-state">{error}</div>
    if (!channel) return null

    const isOwnChannel = loggedInUser?.username === channel.username

    return (
        <div className="channel-profile">
            {channel.coverImage && (
                <img src={channel.coverImage} alt="Cover" className="channel-cover" />
            )}

            <div className="channel-header">
                <img src={channel.avatar} alt={channel.username} className="channel-avatar-large" />
                <div className="channel-info">
                    <h1>{channel.fullName}</h1>
                    <p className="channel-username">@{channel.username}</p>
                    <p className="channel-stats">
                        {channel.subscribersCount} subscribers · {channel.channelsSubscribedToCount} subscribed
                    </p>
                </div>

                {!isOwnChannel && (
                    <button onClick={handleSubscribe} disabled={subLoading} className="subscribe-btn">
                        {channel.isSubscribed ? "Subscribed" : "Subscribe"}
                    </button>
                )}
            </div>

            <div className="channel-videos">
                <h2>Videos</h2>
                {videos.length === 0 ? (
                    <p>No videos uploaded yet.</p>
                ) : (
                    <div className="video-grid">
                        {videos.map((video) => (
                            <VideoCard key={video._id} video={video} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ChannelProfile