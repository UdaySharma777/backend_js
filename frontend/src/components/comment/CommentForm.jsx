import { useState } from "react"

const CommentForm = ({ onSubmit }) => {
    const [content, setContent] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!content.trim()) return

        setIsSubmitting(true)
        try {
            await onSubmit(content)
            setContent("")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="comment-form">
            <input
                type="text"
                placeholder="Add a comment..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isSubmitting}
            />
            <button type="submit" disabled={isSubmitting || !content.trim()}>
                {isSubmitting ? "Posting..." : "Post"}
            </button>
        </form>
    )
}

export default CommentForm