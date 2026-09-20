import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { registerUser } from "../api/auth.api"

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        username: "",
        password: "",
    })
    const [avatar, setAvatar] = useState(null)
    const [coverImage, setCoverImage] = useState(null)
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (!avatar) {
            setError("Avatar image is required")
            return
        }

        setIsSubmitting(true)

        const data = new FormData()
        data.append("fullName", formData.fullName)
        data.append("email", formData.email)
        data.append("username", formData.username)
        data.append("password", formData.password)
        data.append("avatar", avatar)
        if (coverImage) {
            data.append("coverImage", coverImage)
        }

        try {
            await registerUser(data)
            navigate("/login")
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="auth-container">
            <h2>Create account</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="fullName" placeholder="Full name" value={formData.fullName} onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />

                <label>
                    Avatar (required)
                    <input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files[0])} required />
                </label>

                <label>
                    Cover image (optional)
                    <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files[0])} />
                </label>

                {error && <p className="error-text">{error}</p>}
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating account..." : "Sign up"}
                </button>
            </form>
            <p>
                Already have an account? <Link to="/login" >Log in</Link>
            </p>
        </div>
    )
}

export default Register