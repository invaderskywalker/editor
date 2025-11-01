import React from 'react';
import { useSocket } from '../hooks/useSocket';
import '../../styles/ui-panels.css';

interface Comment { _id?: string; author: string; text: string; createdAt?: string; }
interface Props {
  comments: Comment[];
  designId: string;
}

const CommentPanel: React.FC<Props> = ({ comments, designId }) => {
  const socket = useSocket();

  const add = () => {
    const c = { author: 'You', text: `Comment ${comments.length + 1}` };
    socket.current?.emit('comment:add', { designId, comment: c });
  };

  return (
    <div className="ui-panel comment-panel">
      <h3 className="ui-panel-title">Comments</h3>
      {comments.map((c, i) => (
        <div key={c._id ?? i} className="ui-item comment-item">
          <p className="comment-author">{c.author}</p>
          <p className="comment-text">{c.text}</p>
          {c.createdAt && <p className="comment-time">{new Date(c.createdAt).toLocaleString()}</p>}
        </div>
      ))}
      <button onClick={add} className="ui-panel-btn">
        + Add Comment
      </button>
    </div>
  );
};

export default CommentPanel;
