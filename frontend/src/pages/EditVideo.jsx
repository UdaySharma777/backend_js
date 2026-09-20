import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getVideoById, updateVideo, deleteVideo, togglePublishStatus } from "../api/video.api"

const EditVideo = () => {
    const { videoId } = useParams()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({ title: "", description: "" })
    const [thumbnail, setThumbnail] = useState(null)
    const [video, setVideo] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const res = await getVideoById(videoId)
                const v = res.data[0] || res.data
                setVideo(v)
                setFormData({ title: v.title, description: v.description })
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load video")
            } finally {
                setLoading(false)
            }
        }
        fetchVideo()
    }, [videoId])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (!thumbnail) {
            setError("A thumbnail file is currently required to save any edit (backend limitation)")
            return
        }

        setIsSubmitting(true)
        const data = new FormData()
        data.append("title", formData.title)
        data.append("description", formData.description)
        data.append("thumbnail", thumbnail)

        try {
            await updateVideo(videoId, data)
            navigate(`/watch/${videoId}`)
        } catch (err) {
            setError(err.response?.data?.message || "Update failed")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!window.confirm("Delete this video? This cannot be undone.")) return
        try {
            await deleteVideo(videoId)
            navigate("/dashboard")
        } catch (err) {
            setError(err.response?.data?.message || "Delete failed")
        }
    }

    const handleTogglePublish = async () => {
        try {
            const res = await togglePublishStatus(videoId)
            setVideo(res.data)
        } catch (err) {
            setError(err.response?.data?.message || "Failed to toggle publish status")
        }
    }

    if (loading) return <div className="loading-state">Loading...</div>
    if (!video) return <div className="error-state">Video not found</div>

    return (
        <div className="edit-video-page">
            <h2>Edit video</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                <textarea name="description" value={formData.description} onChange={handleChange} required />

                <label>
                    Replace thumbnail (required to save)
                    <input type="file" accept="image/*" onChange={(e) => setThumbnail(e.target.files[0])} required />
                </label>

                {error && <p className="error-text">{error}</p>}
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save changes"}
                </button>
            </form>

            <div className="video-management-actions">
                <button onClick={handleTogglePublish}>
                    {video.isPublished ? "Unpublish" : "Publish"}
                </button>
                <button onClick={handleDelete} className="danger-btn">
                    Delete video
                </button>
            </div>
        </div>
    )
}

export default EditVideo