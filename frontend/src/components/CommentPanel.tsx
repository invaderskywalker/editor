import React, { useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import '../styles/ui-panels.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Comment { _id?: string; author: string; text: string; createdAt?: string; }
interface Props {
  comments: Comment[];
  designId: string;
}

const CommentPanel: React.FC<Props> = ({ comments, designId }) => {
  const socket = useSocket();

  // State for minimization toggle
  const [minimized, setMinimized] = useState(false);
  // State for the comment input value
  const [input, setInput] = useState('');
  // Optionally, track submission state for UX
  const [submitting, setSubmitting] = useState(false);

  // Handler to submit a new comment
  const handleAddComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || submitting) return;
    setSubmitting(true);
    const c = { author: 'You', text: input.trim() };
    try {
      socket.current?.emit('comment:add', { designId, comment: c });
      setInput(''); // Clear input after submit
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={"ui-panel comment-panel" + (minimized ? " minimized" : "")}
      tabIndex={-1}
      aria-label={minimized ? 'Minimized comment panel' : 'Comment panel'}
    >
      {/* <button
        className="comment-panel-toggle"
        aria-label={minimized ? 'Expand Comment Panel' : 'Minimize Comment Panel'}
        onClick={() => setMinimized(m => !m)}
        tabIndex={0}
        type="button"
      >
        {!minimized ? (
          <ChevronRight size={22} stroke="#3678fa" aria-hidden="true" />
        ) : (
          <ChevronLeft size={22} stroke="#3678fa" aria-hidden="true" />
        )}
      </button> */}

      <div className="comment-panel-toggle"
        aria-label={minimized ? 'Expand Comment Panel' : 'Minimize Comment Panel'}
        onClick={() => setMinimized(m => !m)}
        tabIndex={0}>

      {!minimized ? (
        <ChevronRight size={22} stroke="#3678fa" aria-hidden="true" />
      ) : (
        <ChevronLeft size={22} stroke="#3678fa" aria-hidden="true" />
      )}
      </div>

      <div className="ui-panel-header" style={{ display: minimized ? 'none' : 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 className="ui-panel-title" style={{ margin: 0 }}>Comments</h3>
      </div>

      {minimized ? null : (
        <>
          <div className="comment-list">
            {comments.map((c, i) => (
              <div key={c._id ?? i} className="ui-item comment-item">
                <p className="comment-author">{c.author}</p>
                <p className="comment-text">{c.text}</p>
                {c.createdAt && <p className="comment-time">{new Date(c.createdAt).toLocaleString()}</p>}
              </div>
            ))}
          </div>
          <form onSubmit={handleAddComment} className="comment-input-form" style={{ marginTop: 8, display: 'flex', gap: 6 }}>
            <input
              type="text"
              className="comment-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              aria-label="Add a comment"
              placeholder="Type your comment..."
              disabled={submitting}
              style={{ flex: 1, minWidth: 0 }}
            />
            <button
              type="submit"
              className="ui-panel-btn"
              disabled={!input.trim() || submitting}
              style={{ minWidth: 90 }}
            >
              Add Comment
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default CommentPanel;
