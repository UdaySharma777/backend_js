import { useState } from "react"
import { useAuth } from "../../context/AuthContext"

const CommentList = ({ comments, onDelete, onUpdate }) => {
    const { user } = useAuth()
    const [editingId, setEditingId] = useState(null)
    const [editContent, setEditContent] = useState("")

    if (!comments || comments.length === 0) {
        return <p className="no-comments">No comments yet. Be the first to comment.</p>
    }

    const startEditing = (comment) => {
        setEditingId(comment._id)
        setEditContent(comment.content)
    }

    const cancelEditing = () => {
        setEditingId(null)
        setEditContent("")
    }

    const saveEdit = async (commentId) => {
        if (!editContent.trim()) return
        await onUpdate(commentId, editContent)
        setEditingId(null)
        setEditContent("")
    }

    return (
        <div className="comment-list">
            {comments.map((comment) => {
                const owner = comment.owner || {}
                const isOwnComment = user?._id === owner._id
                const isEditing = editingId === comment._id

                return (
                    <div key={comment._id} className="comment-item">
                        {owner.avatar && (
                            <img src={owner.avatar} alt={owner.username} className="comment-avatar" />
                        )}
                        <div className="comment-body">
                            <span className="comment-author">{owner.username || "User"}</span>

                            {isEditing ? (
                                <div className="comment-edit-form">
                                    <input
                                        type="text"
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        autoFocus
                                    />
                                    <div className="comment-edit-actions">
                                        <button onClick={() => saveEdit(comment._id)}>Save</button>
                                        <button onClick={cancelEditing} className="comment-cancel-btn">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <p className="comment-content">{comment.content}</p>
                            )}
                        </div>

                        {isOwnComment && !isEditing && (
                            <div className="comment-actions">
                                <button onClick={() => startEditing(comment)} className="comment-edit-btn">
                                    Edit
                                </button>
                                {onDelete && (
                                    <button onClick={() => onDelete(comment._id)} className="comment-delete-btn">
                                        Delete
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default CommentList