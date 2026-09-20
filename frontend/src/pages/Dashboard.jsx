import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getChannelStats, getChannelVideos } from "../api/dashboard.api"

const Dashboard = () => {
    const [stats, setStats] = useState(null)
    const [videos, setVideos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const [statsRes, videosRes] = await Promise.all([
                    getChannelStats(),
                    getChannelVideos(),
                ])
                setStats(statsRes.data)
                // guard against either a plain array or a paginated { docs } shape
                setVideos(videosRes.data?.docs || videosRes.data || [])
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load dashboard")
            } finally {
                setLoading(false)
            }
        }
        fetchDashboard()
    }, [])

    if (loading) return <div className="loading-state">Loading...</div>
    if (error) return <div className="error-state">{error}</div>

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h2>Your channel</h2>
                <Link to="/upload" className="upload-btn">Upload video</Link>
            </div>

            {stats && (
                <div className="dashboard-stats">
                    {/* field names are guesses — confirm against the real controller */}
                    <div className="stat-card">
                        <span className="stat-value">{stats.totalVideos ?? "—"}</span>
                        <span className="stat-label">Videos</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{stats.totalViews ?? "—"}</span>
                        <span className="stat-label">Views</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{stats.totalSubscribers ?? "—"}</span>
                        <span className="stat-label">Subscribers</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{stats.totalLikes ?? "—"}</span>
                        <span className="stat-label">Likes</span>
                    </div>
                </div>
            )}

            <h3>Your videos</h3>
            {videos.length === 0 ? (
                <p>You haven't uploaded any videos yet.</p>
            ) : (
                <table className="dashboard-video-list">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Status</th>
                            <th>Views</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {videos.map((v) => (
                            <tr key={v._id}>
                                <td>{v.title}</td>
                                <td>{v.isPublished ? "Published" : "Unpublished"}</td>
                                <td>{v.views}</td>
                                <td>
                                    <Link to={`/edit/${v._id}`}>Edit</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default Dashboard