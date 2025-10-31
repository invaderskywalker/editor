// src/components/CommentPanel.tsx
import React from 'react';
import { type CommentDTO } from '../api/api';

interface Props {
  comments: CommentDTO[];
  onAddComment: (c: Omit<CommentDTO, '_id'>) => void;
}

const CommentPanel: React.FC<Props> = ({ comments, onAddComment }) => {
  return (
    <div className="w-80 bg-white border-l p-4 overflow-y-auto">
      <h3 className="font-bold text-lg mb-3">Comments</h3>
      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c._id} className="bg-gray-50 p-3 rounded">
            <p className="text-sm font-medium">{c.author}</p>
            <p className="text-sm text-gray-700">{c.message}</p>
            <p className="text-xs text-gray-500 mt-1">
              {c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
            </p>
          </div>
        ))}
      </div>
      <button
        onClick={() =>
          onAddComment({
            author: 'You',
            message: `Comment ${comments.length + 1}`,
          })
        }
        className="mt-4 w-full px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
      >
        + Add Comment
      </button>
    </div>
  );
};

export default CommentPanel;