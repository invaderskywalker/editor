import { configureStore } from '@reduxjs/toolkit';
import designReducer from './designSlice';
import layerReducer from './layerSlice';
import commentReducer from './commentSlice';

export const store = configureStore({
  reducer: {
    design: designReducer,
    layers: layerReducer,
    comments: commentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
