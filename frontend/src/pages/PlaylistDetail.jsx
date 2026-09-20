import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getPlaylistById, removeVideoFromPlaylist, deletePlaylist } from "../api/playlist.api"
import VideoCard from "../components/video/VideoCard"

const PlaylistDetail = () => {
    const { playlistId } = useParams()
    const navigate = useNavigate()
    const [playlist, setPlaylist] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchPlaylist = useCallback(async () => {
        try {
            const res = await getPlaylistById(playlistId)
            setPlaylist(res.data)
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load playlist")
        } finally {
            setLoading(false)
        }
    }, [playlistId])

    useEffect(() => {
        fetchPlaylist()
    }, [fetchPlaylist])

    const handleRemoveVideo = async (videoId) => {
        try {
            await removeVideoFromPlaylist(videoId, playlistId)
            fetchPlaylist()
        } catch (err) {
            console.error("Failed to remove video", err)
        }
    }

    const handleDeletePlaylist = async () => {
        if (!window.confirm("Delete this playlist?")) return
        try {
            await deletePlaylist(playlistId)
            navigate("/playlists")
        } catch (err) {
            console.error("Failed to delete playlist", err)
        }
    }

    if (loading) return <div className="loading-state">Loading...</div>
    if (error) return <div className="error-state">{error}</div>
    if (!playlist) return null

    return (
        <div className="playlist-detail-page">
            <div className="playlist-detail-header">
                <h2>{playlist.name}</h2>
                <p>{playlist.description}</p>
                <button onClick={handleDeletePlaylist} className="danger-btn">
                    Delete playlist
                </button>
            </div>

            {(!playlist.videos || playlist.videos.length === 0) ? (
                <p>No videos in this playlist yet.</p>
            ) : (
                <div className="video-grid">
                    {playlist.videos.map((video) => (
                        <div key={video._id} className="playlist-video-item">
                            <VideoCard video={video} />
                            <button onClick={() => handleRemoveVideo(video._id)}>Remove</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default PlaylistDetail