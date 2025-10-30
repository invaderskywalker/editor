/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface FabricObjectData {
  type: string;
  [key: string]: any;
}

export interface CanvasData {
  version: string;
  objects: FabricObjectData[];
}

export interface DesignState {
  canvasData: CanvasData | null;
}

const initialState: DesignState = {
  canvasData: null,
};

const designSlice = createSlice({
  name: 'design',
  initialState,
  reducers: {
    setCanvasData(state, action: PayloadAction<CanvasData | null>) {
      state.canvasData = action.payload;
    },
  },
});

export const { setCanvasData } = designSlice.actions;
export default designSlice.reducer;
