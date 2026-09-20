import { useState, useEffect, useCallback } from "react"
import { useParams, Link } from "react-router-dom"
import { getVideoById } from "../api/video.api"
import { getVideoComments, addComment, deleteComment, updateComment } from "../api/comment.api"
import { toggleVideoLike } from "../api/like.api"
import { toggleSubscription } from "../api/subscription.api"
import CommentForm from "../components/comment/CommentForm"
import CommentList from "../components/comment/CommentList"

const VideoPlayer = () => {
    const { videoId } = useParams()
    const [video, setVideo] = useState(null)
    const [comments, setComments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchVideo = useCallback(async () => {
        try {
            const res = await getVideoById(videoId)
            setVideo(res.data[0] || res.data)
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load video")
        }
    }, [videoId])

    const fetchComments = useCallback(async () => {
        try {
            const res = await getVideoComments(videoId)
            setComments(res.data.docs || res.data)
        } catch (err) {
            console.error("Failed to load comments", err)
        }
    }, [videoId])

    useEffect(() => {
        setLoading(true)
        Promise.all([fetchVideo(), fetchComments()]).finally(() => setLoading(false))
    }, [fetchVideo, fetchComments])

    const handleLike = async () => {
        try {
            const res = await toggleVideoLike(videoId)
            setVideo ((prev) => ({
                ...prev,
                isLiked: !prev.isLiked,
                likesCount: prev.isLiked ? prev.likesCount-1 : prev.likesCount+1
            }))
        } catch (err) {
            console.error("Failed to toggle like", err)
        }
    }

    const handleSubscribe = async () => {
        if (!video?.owner?._id) return
        try {
            await toggleSubscription(video.owner._id)
        } catch (err) {
            console.error("Failed to toggle subscription", err)
        }
    }

    const handleAddComment = async (content) => {
        await addComment(videoId, content)
        const res = await getVideoComments(videoId)
        setComments(res.data.docs || res.data)
    }

    const handleDeleteComment = async (commentId) => {
        try {
            await deleteComment(commentId)
            fetchComments()
        } catch (err) {
            console.error("Failed to delete comment", err)
        }
    }

    const handleUpdateComment = async (commentId, content) => {
    try {
        await updateComment(commentId, content)
        fetchComments()
    } catch (err) {
        console.error("Failed to update comment", err)
    }
}

    if (loading) return <div className="loading-state">Loading...</div>
    if (error) return <div className="error-state">{error}</div>
    if (!video) return <div className="error-state">Video not found</div>

    return (
        <div className="video-player-page">
            <video controls src={video.videoFile} poster={video.thumbnail} className="video-player" />

            <h1>{video.title}</h1>

            <div className="video-actions">
                <button onClick={handleLike}>
                    {video.isLiked ? "👍 Liked" : "👍 Like"} ({video.likesCount ?? 0})
                </button>

                {video.owner && (
                    <Link to={`/channel/${video.owner.username}`} className="channel-link">
                        <img src={video.owner.avatar} alt={video.owner.username} className="channel-avatar" />
                        <span>{video.owner.fullName}</span>
                    </Link>
                )}

                <button onClick={handleSubscribe}>Subscribe</button>
            </div>

            <p className="video-meta">{video.views} views</p>
            <p className="video-description">{video.description}</p>

            <div className="comments-section">
                <h3>Comments</h3>
                <CommentForm onSubmit={handleAddComment} />
                <CommentList comments={comments} onDelete={handleDeleteComment} onUpdate={handleUpdateComment} />
            </div>
        </div>
    )
}

export default VideoPlayer