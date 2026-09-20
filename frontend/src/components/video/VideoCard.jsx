import { Link } from "react-router-dom"

const formatDuration = (seconds) => {
    if (!seconds) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
}

const formatViews = (views) => {
    if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M views`
    if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K views`
    return `${views} views`
}

const VideoCard = ({ video }) => {
    // owner comes populated from the backend's $lookup — guard against it being missing
    const owner = video.owner || {}

    return (
        <Link to={`/watch/${video._id}`} className="video-card">
            <div className="video-card__thumbnail-wrapper">
                <img src={video.thumbnail} alt={video.title} className="video-card__thumbnail" />
                <span className="video-card__duration">{formatDuration(video.duration)}</span>
            </div>

            <div className="video-card__info">
                <img
                    src={owner.avatar}
                    alt={owner.username}
                    className="video-card__avatar"
                />
                <div className="video-card__text">
                    <h3 className="video-card__title">{video.title}</h3>
                    <p className="video-card__channel">{owner.fullName || owner.username}</p>
                    <p className="video-card__meta">{formatViews(video.views)}</p>
                </div>
            </div>
        </Link>
    )
}

export default VideoCard