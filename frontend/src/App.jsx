import { Routes, Route } from "react-router-dom"
import Navbar from "./components/layout/Navbar"
import Sidebar from "./components/layout/Sidebar"
import ProtectedRoute from "./components/common/ProtectedRoute"

import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import VideoPlayer from "./pages/VideoPlayer"
import ChannelProfile from "./pages/ChannelProfile"
import UploadVideo from "./pages/UploadVideo"
import EditVideo from "./pages/EditVideo"
import Dashboard from "./pages/Dashboard"
import Playlists from "./pages/Playlists"
import PlaylistDetail from "./pages/PlaylistDetail"
import WatchHistory from "./pages/WatchHistory"
import "./App.css"

function App() {
    return (
        <>
            <Navbar />
            <div className="app-body">
                <Sidebar />
                <main className="main-content">
                    <Routes>
                        {/* Public routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        {/* Protected routes */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <Home />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/watch/:videoId"
                            element={
                                <ProtectedRoute>
                                    <VideoPlayer />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/channel/:username"
                            element={
                                <ProtectedRoute>
                                    <ChannelProfile />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/upload"
                            element={
                                <ProtectedRoute>
                                    <UploadVideo />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/edit/:videoId"
                            element={
                                <ProtectedRoute>
                                    <EditVideo />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/playlists"
                            element={
                                <ProtectedRoute>
                                    <Playlists />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/playlist/:playlistId"
                            element={
                                <ProtectedRoute>
                                    <PlaylistDetail />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/history"
                            element={
                                <ProtectedRoute>
                                    <WatchHistory />
                                </ProtectedRoute>
                            }
                        />

                        {/* Fallback */}
                        <Route path="*" element={<div>Page not found</div>} />
                    </Routes>
                </main>
            </div>
        </>
    )
}

export default App