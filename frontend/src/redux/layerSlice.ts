import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface LayerInfo {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
}

export interface LayerState {
  layers: LayerInfo[];
  selectedLayerId: string | null;
}

const initialState: LayerState = {
  layers: [],
  selectedLayerId: null,
};

const layerSlice = createSlice({
  name: 'layers',
  initialState,
  reducers: {
    addLayer(state, action: PayloadAction<LayerInfo>) {
      state.layers.push(action.payload);
    },
    removeLayer(state, action: PayloadAction<string>) {
      state.layers = state.layers.filter(l => l.id !== action.payload);
      if (state.selectedLayerId === action.payload) {
        state.selectedLayerId = null;
      }
    },
    selectLayer(state, action: PayloadAction<string>) {
      state.selectedLayerId = action.payload;
    },
    updateLayer(state, action: PayloadAction<LayerInfo>) {
      const idx = state.layers.findIndex(l => l.id === action.payload.id);
      if (idx !== -1) {
        state.layers[idx] = action.payload;
      }
    }
  }
});

export const { addLayer, removeLayer, selectLayer, updateLayer } = layerSlice.actions;
export default layerSlice.reducer;
