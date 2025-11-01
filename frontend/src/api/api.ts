/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: { 'Content-Type': 'application/json' },
});

/* ---------- DESIGN ---------- */
export const createDesign = async (title: string) => {
  const { data } = await api.post('/designs', { title });
  return data.data;
};

export const getDesign = async (id: string) => {
  const { data } = await api.get(`/designs/${id}`);
  return data.data;
};

export const updateDesign = async (id: string, updates: Partial<any>) => {
  const { data } = await api.put(`/designs/${id}`, updates);
  return data.data;
};

/* ---------- LAYERS / COMMENTS – **socket only** ---------- */
export const addLayer = () => { throw new Error('Use socket'); };
export const deleteLayer = () => { throw new Error('Use socket'); };
export const addComment = () => { throw new Error('Use socket'); };