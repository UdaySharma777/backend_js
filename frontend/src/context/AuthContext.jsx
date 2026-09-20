import { createContext, useContext, useState, useEffect } from "react"
import { getCurrentUser, loginUser as loginApi, logoutUser as logoutApi } from "../api/auth.api"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // On app load, ask the backend if the httpOnly cookie is still valid
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await getCurrentUser()
                setUser(res.data)
            } catch (error) {
                setUser(null)
            } finally {
                setLoading(false)
            }
        }
        checkAuth()
    }, [])

    const login = async (credentials) => {
        const res = await loginApi(credentials)
        setUser(res.data.user)
        return res.data.user
    }

    const logout = async () => {
        await logoutApi()
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}