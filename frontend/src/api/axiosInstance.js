import axios from "axios"

const axiosInstance = axios.create({
    baseURL: "https://backend-js-1w3g.onrender.com/api/v1",
    withCredentials: true,
})

let isRefreshing = false
let refreshSubscribers = []

const subscribeTokenRefresh = (resolve, reject) => {
    refreshSubscribers.push({ resolve, reject })
}

const onRefreshed = () => {
    refreshSubscribers.forEach(({ resolve }) => resolve())
    refreshSubscribers = []
}

const onRefreshFailed = (error) => {
    refreshSubscribers.forEach(({ reject }) => reject(error))
    refreshSubscribers = []
}

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            if (!isRefreshing) {
                isRefreshing = true
                try {
                    await axiosInstance.post("/users/refresh-token")
                    isRefreshing = false
                    onRefreshed()
                } catch (refreshError) {
                    isRefreshing = false
                    onRefreshFailed(refreshError) // now properly rejects every queued request
                    return Promise.reject(refreshError)
                }
            }

            return new Promise((resolve, reject) => {
                subscribeTokenRefresh(resolve, reject)
            }).then(() => axiosInstance(originalRequest))
        }

        return Promise.reject(error)
    }
)

export default axiosInstance