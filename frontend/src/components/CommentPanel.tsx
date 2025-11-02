/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import '../styles/ui-panels.css';
// import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useUser } from '../hooks/useUser';


interface Comment {
  _id?: string;
  text: string;
  createdAt?: string;
  user?: {
    _id?: string;
    name?: string;
    email?: string;
    avatar?: string;
  };
}

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

  const { user } = useUser();

  const handleAddComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || submitting || !user) return;

    setSubmitting(true);
    const c = {
      userId: user._id,
      text: input.trim(),
    };
    try {
      socket.current?.emit('comment:add', { designId, comment: c });
      setInput('');
    } finally {
      setSubmitting(false);
    }
  };

  const getAvatarLetter = (name?: string) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };


  return (
    <div className={"ui-panel comment-panel" + (minimized ? " minimized" : "")}
      tabIndex={-1}
      aria-label={minimized ? 'Minimized comment panel' : 'Comment panel'}
    >

      {/* <div className="comment-panel-toggle"
        aria-label={minimized ? 'Expand Comment Panel' : 'Minimize Comment Panel'}
        onClick={() => setMinimized(m => !m)}
        tabIndex={0}>

        {!minimized ? (
          <ChevronRight size={22} stroke="#3678fa" aria-hidden="true" />
        ) : (
          <ChevronLeft size={22} stroke="#3678fa" aria-hidden="true" />
        )}
      </div> */}

      <div className="ui-panel-header" style={{ display: minimized ? 'none' : 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 className="ui-panel-title" style={{ margin: 0 }}>Comments</h3>
      </div>

      {minimized ? null : (
        <>
          <div className="comment-list">
            {comments.map((c, i) => (
              <div key={c._id ?? i} className="ui-item comment-item" style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    background: '#2668d7',
                    color: 'white',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textTransform: 'uppercase',
                    flexShrink: 0,
                  }}
                >
                  {getAvatarLetter(c.user?.name)}
                </div>
                <div>
                  <p className="comment-author" style={{ fontWeight: 600, margin: 0 }}>
                    {c.user?.name || 'Unknown'}
                  </p>
                  <p className="comment-text" style={{ margin: 0 }}>{c.text}</p>
                  {c.createdAt && (
                    <p className="comment-time" style={{ fontSize: '0.75rem', color: '#777' }}>
                      {new Date(c.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>
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
