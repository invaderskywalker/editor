import axios from 'axios';

// Types
export interface CanvasDataDTO {
  version: string;
  objects: any[];
}
export interface LayerDTO {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
}
export interface CommentDTO {
  id: string;
  author: string;
  message: string;
  createdAt: string;
  targetObjectId: string | null;
}

const api = axios.create({
  baseURL: '/api', // Adjust as needed in your backend
});

// Canvas API
export const fetchCanvasData = async (): Promise<CanvasDataDTO> => {
  // Placeholder stub
  return { version: '1.0', objects: [] };
};

export const saveCanvasData = async (data: CanvasDataDTO): Promise<void> => {
  // Placeholder stub
  return;
};

// Layers API
export const fetchLayers = async (): Promise<LayerDTO[]> => {
  return [];
};
export const addLayerAPI = async (layer: LayerDTO): Promise<LayerDTO> => {
  return layer;
};
// Comments API
export const fetchComments = async (): Promise<CommentDTO[]> => {
  return [];
};
export const addCommentAPI = async (comment: CommentDTO): Promise<CommentDTO> => {
  return comment;
};
// All API endpoints above can later be swapped with real axios calls, e.g.:
// const resp = await api.get('/canvas');
// return resp.data;