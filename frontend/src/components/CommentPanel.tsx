import React from 'react';
import { useSocket } from '../hooks/useSocket';

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
    <div className="w-80 bg-white border-l p-4 overflow-y-auto">
      <h3 className="font-bold text-lg mb-3">Comments</h3>
      {comments.map((c, i) => (
        <div key={c._id ?? i} className="bg-gray-50 p-3 rounded mb-2">
          <p className="font-medium text-sm">{c.author}</p>
          <p className="text-sm text-gray-700">{c.text}</p>
          {c.createdAt && <p className="text-xs text-gray-500">{new Date(c.createdAt).toLocaleString()}</p>}
        </div>
      ))}
      <button onClick={add} className="mt-4 w-full px-3 py-1.5 bg-green-600 text-white rounded">
        + Add Comment
      </button>
    </div>
  );
};

export default CommentPanel;