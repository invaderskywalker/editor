/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

export interface CanvasDataDTO {
  version: string;
  objects: any[];
}

export interface LayerDTO {
  _id?: string;
  name: string;
  visible: boolean;
  locked: boolean;
}

export interface CommentDTO {
  _id?: string;
  author: string;
  message: string;
  createdAt?: string;
  targetObjectId?: string | null;
}

// --- Axios instance ---
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: { 'Content-Type': 'application/json' },
});

// --- DESIGN / CANVAS ---
export const fetchCanvasData = async (): Promise<CanvasDataDTO[]> => {
  const res = await api.get('/designs');
  return res.data;
};

export const saveCanvasData = async (data: CanvasDataDTO): Promise<void> => {
  await api.post('/designs', data);
};

// --- LAYERS ---
export const fetchLayers = async (): Promise<LayerDTO[]> => {
  const res = await api.get('/layers');
  return res.data;
};

export const addLayerAPI = async (layer: LayerDTO): Promise<LayerDTO> => {
  const res = await api.post('/layers', layer);
  return res.data;
};

// --- COMMENTS ---
export const fetchComments = async (): Promise<CommentDTO[]> => {
  const res = await api.get('/comments');
  return res.data;
};

export const addCommentAPI = async (comment: CommentDTO): Promise<CommentDTO> => {
  const res = await api.post('/comments', comment);
  return res.data;
};
