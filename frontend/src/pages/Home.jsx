import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "react-router-dom"
import { getAllVideos } from "../api/video.api"
import VideoCard from "../components/video/VideoCard"

const Home = () => {
    const [searchParams] = useSearchParams()
    const query = searchParams.get("query") || ""

    const [videos, setVideos] = useState([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const fetchVideos = useCallback(async (pageNum, searchQuery) => {
        setLoading(true)
        setError("")
        try {
            const res = await getAllVideos({ page: pageNum, limit: 12, query: searchQuery })
            setVideos(res.data.docs)
            setTotalPages(res.data.totalPages)
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load videos")
        } finally {
            setLoading(false)
        }
    }, [])

    // whenever the search query changes, reset to page 1 and refetch
    useEffect(() => {
        setPage(1)
        fetchVideos(1, query)
    }, [query, fetchVideos])

    // page changes (not triggered by a query change) just refetch the current query at the new page
    useEffect(() => {
        if (page === 1) return // already handled by the effect above on query change
        fetchVideos(page, query)
    }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

    if (loading) return <div className="loading-state">Loading videos...</div>
    if (error) return <div className="error-state">{error}</div>

    return (
        <div className="home-page">
            {query && (
                <p className="search-results-label">
                    Results for "<strong>{query}</strong>"
                </p>
            )}

            {videos.length === 0 ? (
                <p>{query ? "No videos found." : "No videos yet."}</p>
            ) : (
                <div className="video-grid">
                    {videos.map((video) => (
                        <VideoCard key={video._id} video={video} />
                    ))}
                </div>
            )}

            {videos.length > 0 && (
                <div className="pagination">
                    <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                        Previous
                    </button>
                    <span>
                        Page {page} of {totalPages}
                    </span>
                    <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                        Next
                    </button>
                </div>
            )}
        </div>
    )
}

export default Home