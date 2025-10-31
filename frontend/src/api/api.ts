/* eslint-disable @typescript-eslint/no-explicit-any */
// src/api/api.ts
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
  data?: any;
}

export interface CommentDTO {
  _id?: string;
  author: string;
  message: string;
  createdAt?: string;
  objectId?: string | null;
}

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: { 'Content-Type': 'application/json' },
});

// === DESIGN ===
export const createDesign = async (title: string) => {
  const res = await api.post('/designs', { title });
  return res.data.data;
};

export const getDesign = async (id: string) => {
  const res = await api.get(`/designs/${id}`);
  return res.data.data;
};

export const updateDesign = async (id: string, updates: Partial<any>) => {
  const res = await api.put(`/designs/${id}`, updates);
  return res.data.data;
};

// === LAYERS ===
export const getLayers = async (designId: string): Promise<LayerDTO[]> => {
  const res = await api.get(`/designs/${designId}/layers`);
  return res.data.data;
};

export const addLayer = async (designId: string, layer: Omit<LayerDTO, '_id'>): Promise<LayerDTO> => {
  const res = await api.post(`/designs/${designId}/layers`, layer);
  return res.data.data;
};

export const updateLayer = async (designId: string, layerId: string, updates: Partial<LayerDTO>) => {
  const res = await api.put(`/designs/${designId}/layers/${layerId}`, updates);
  return res.data.data;
};

export const deleteLayer = async (designId: string, layerId: string) => {
  await api.delete(`/designs/${designId}/layers/${layerId}`);
};

// === COMMENTS ===
export const getComments = async (designId: string): Promise<CommentDTO[]> => {
  const res = await api.get(`/designs/${designId}/comments`);
  return res.data.data;
};

export const addComment = async (designId: string, comment: Omit<CommentDTO, '_id'>): Promise<CommentDTO> => {
  const res = await api.post(`/designs/${designId}/comments`, comment);
  return res.data.data;
};