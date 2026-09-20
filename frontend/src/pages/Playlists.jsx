import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getUserPlaylists, createPlaylist } from "../api/playlist.api"

const Playlists = () => {
    const [playlists, setPlaylists] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({ name: "", description: "" })
    const [isSubmitting, setIsSubmitting] = useState(false)

    const fetchPlaylists = async () => {
        try {
            const res = await getUserPlaylists()
            setPlaylists(res.data)
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load playlists")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPlaylists()
    }, [])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleCreate = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await createPlaylist(formData)
            setFormData({ name: "", description: "" })
            setShowForm(false)
            fetchPlaylists()
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create playlist")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) return <div className="loading-state">Loading...</div>

    return (
        <div className="playlists-page">
            <div className="playlists-header">
                <h2>Your playlists</h2>
                <button onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Cancel" : "New playlist"}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="playlist-form">
                    <input
                        type="text"
                        name="name"
                        placeholder="Playlist name"
                        value={formData.name}
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
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create"}
                    </button>
                </form>
            )}

            {error && <p className="error-text">{error}</p>}

            {playlists.length === 0 ? (
                <p>No playlists yet.</p>
            ) : (
                <div className="playlist-grid">
                    {playlists.map((playlist) => (
                        <Link key={playlist._id} to={`/playlist/${playlist._id}`} className="playlist-card">
                            <h3>{playlist.name}</h3>
                            <p>{playlist.description}</p>
                            <span>{playlist.videos?.length || 0} videos</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Playlists