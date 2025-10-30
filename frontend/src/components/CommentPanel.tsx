import React from 'react';
import { type CommentDTO } from '../api/api';

interface Props {
  comments: CommentDTO[];
  onAddComment: (c: CommentDTO) => void;
}

const CommentPanel: React.FC<Props> = ({ comments, onAddComment }) => {
  return (
    <div className="w-64 bg-white border-l p-2">
      <h3 className="font-bold mb-2">Comments</h3>
      <ul className="space-y-2">
        {comments.map((c) => (
          <li key={c._id} className="border p-1 rounded">
            <p className="text-sm">{c.message}</p>
            <p className="text-xs text-gray-500">– {c.author}</p>
          </li>
        ))}
      </ul>
      <button
        onClick={() =>
          onAddComment({
            author: 'Guest',
            message: `New comment ${comments.length + 1}`,
            targetObjectId: null,
          })
        }
        className="mt-2 px-2 py-1 bg-green-500 text-white rounded"
      >
        + Add Comment
      </button>
    </div>
  );
};

export default CommentPanel;
