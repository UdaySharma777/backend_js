import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { publishAVideo } from "../api/video.api"

const UploadVideo = () => {
    const [formData, setFormData] = useState({ title: "", description: "" })
    const [videoFile, setVideoFile] = useState(null)
    const [thumbnail, setThumbnail] = useState(null)
    const [progress, setProgress] = useState(0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (!videoFile || !thumbnail) {
            setError("Both video file and thumbnail are required")
            return
        }

        setIsSubmitting(true)

        const data = new FormData()
        data.append("title", formData.title)
        data.append("description", formData.description)
        data.append("videoFile", videoFile)
        data.append("thumbnail", thumbnail)

        try {
            const res = await publishAVideo(data, (progressEvent) => {
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                setProgress(percent)
            })
            navigate(`/watch/${res.data._id}`)
        } catch (err) {
            setError(err.response?.data?.message || "Upload failed. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="upload-page">
            <h2>Upload video</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="title"
                    placeholder="Title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />
                <textarea
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                />

                <label>
                    Video file
                    <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setVideoFile(e.target.files[0])}
                        required
                    />
                </label>

                <label>
                    Thumbnail
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setThumbnail(e.target.files[0])}
                        required
                    />
                </label>

                {isSubmitting && (
                    <div className="upload-progress">
                        <div className="upload-progress__bar" style={{ width: `${progress}%` }} />
                        <span>{progress}%</span>
                    </div>
                )}

                {error && <p className="error-text">{error}</p>}

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Uploading..." : "Publish"}
                </button>
            </form>
        </div>
    )
}

export default UploadVideo