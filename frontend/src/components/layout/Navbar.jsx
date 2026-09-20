import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

const Navbar = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [searchTerm, setSearchTerm] = useState(searchParams.get("query") || "")

    const handleLogout = async () => {
        await logout()
        navigate("/login")
    }

    const handleSearch = (e) => {
        e.preventDefault()
        const trimmed = searchTerm.trim()
        if (trimmed) {
            navigate(`/?query=${encodeURIComponent(trimmed)}`)
        } else {
            navigate("/")
        }
    }

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-logo">
                YourApp
            </Link>

            {user && (
                <form onSubmit={handleSearch} className="navbar-search">
                    <input
                        type="text"
                        placeholder="Search videos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit" aria-label="Search">🔍</button>
                </form>
            )}

            {user && (
                <div className="navbar-links">
                    <Link to={`/channel/${user.username}`} className="navbar-profile">
                        <img src={user.avatar} alt={user.username} className="navbar-avatar" />
                    </Link>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            )}
        </nav>
    )
}

export default Navbar