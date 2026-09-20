import axiosInstance from "./axiosInstance"

export const registerUser = async (formData) => {
    // formData must be a FormData instance (fullName, email, username, password, avatar, coverImage)
    const response = await axiosInstance.post("/users/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data
}

export const loginUser = async ({ email, username, password }) => {
    const response = await axiosInstance.post("/users/login", { email, username, password })
    return response.data
}

export const logoutUser = async () => {
    const response = await axiosInstance.post("/users/logout")
    return response.data
}

export const getCurrentUser = async () => {
    const response = await axiosInstance.get("/users/current-user")
    return response.data
}