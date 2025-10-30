import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Comment {
  id: string;
  author: string;
  message: string;
  createdAt: string;
  targetObjectId: string | null;
}

export interface CommentState {
  comments: Comment[];
}

const initialState: CommentState = {
  comments: []
};

const commentSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    addComment(state, action: PayloadAction<Comment>) {
      state.comments.push(action.payload);
    },
    removeComment(state, action: PayloadAction<string>) {
      state.comments = state.comments.filter(c => c.id !== action.payload);
    },
    updateComment(state, action: PayloadAction<Comment>) {
      const idx = state.comments.findIndex(c => c.id === action.payload.id);
      if (idx !== -1) {
        state.comments[idx] = action.payload;
      }
    }
  }
});

export const { addComment, removeComment, updateComment } = commentSlice.actions;
export default commentSlice.reducer;
