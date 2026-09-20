import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const Login = () => {
    const [formData, setFormData] = useState({ identifier: "", password: "" })
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setIsSubmitting(true)

        // "identifier" can be either an email or a username — only send the matching field
        const isEmail = formData.identifier.includes("@")
        const credentials = isEmail
            ? { email: formData.identifier, password: formData.password }
            : { username: formData.identifier, password: formData.password }

        try {
            await login(credentials)
            navigate("/")
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="auth-container">
            <h2>Log in</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="identifier"
                    placeholder="Email or username"
                    value={formData.identifier}
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                {error && <p className="error-text">{error}</p>}
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Logging in..." : "Log in"}
                </button>
            </form>
            <p>
                Don't have an account? <Link to="/register">Sign up</Link>
            </p>
        </div>
    )
}

export default Login