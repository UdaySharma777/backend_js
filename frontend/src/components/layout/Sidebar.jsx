import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

const Sidebar = () => {
    const { user } = useAuth()

    return (
        <aside className="sidebar">
            <Link to="/">Home</Link>
            {user && (
                <>
                    <Link to="/upload">Upload</Link>
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/playlists">Playlists</Link>
                    <Link to="/history">Watch history</Link>
                </>
            )}
        </aside>
    )
}

export default Sidebar