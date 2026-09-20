import { useState, useEffect } from "react"
import { getWatchHistory } from "../api/user.api"
import VideoCard from "../components/video/VideoCard"

const WatchHistory = () => {
    const [videos, setVideos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await getWatchHistory()
                setVideos(res.data)
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load watch history")
            } finally {
                setLoading(false)
            }
        }
        fetchHistory()
    }, [])

    if (loading) return <div className="loading-state">Loading...</div>
    if (error) return <div className="error-state">{error}</div>

    return (
        <div className="watch-history-page">
            <h2>Watch history</h2>
            {videos.length === 0 ? (
                <p>No videos watched yet.</p>
            ) : (
                <div className="video-grid">
                    {videos.map((video) => (
                        <VideoCard key={video._id} video={video} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default WatchHistory