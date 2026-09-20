import axios from "axios"

const BASE_URL = "https://backend-js-1w3g.onrender.com/api/v1"

const axiosInstance = axios.create({
    baseURL: BASE_URL,
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

        if (originalRequest?.url?.includes("/users/refresh-token")) {
            return Promise.reject(error)
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            if (!isRefreshing) {
                isRefreshing = true
                try {
                    // Plain axios call — deliberately bypasses axiosInstance's interceptors
                    // so this request can never recursively re-trigger this same handler.
                    await axios.post(
                        `${BASE_URL}/users/refresh-token`,
                        {},
                        { withCredentials: true }
                    )
                    isRefreshing = false
                    onRefreshed()
                } catch (refreshError) {
                    isRefreshing = false
                    onRefreshFailed(refreshError)
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