import axios from 'axios';

const API_BASE = '/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage if present
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('speechsense_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  getMe: () => client.get('/auth/me'),

  // Transcription
  transcribeUpload: (formData) => client.post('/transcribe/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  transcribeRecording: (formData) => client.post('/transcribe/recording', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  transcribeLiveChunk: (formData) => client.post('/transcribe/live/chunk', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getTranscription: (id) => client.get(`/transcribe/${id}`),
  updateTranscript: (id, text) => client.put(`/transcribe/${id}`, { edited_transcript: text }),
  deleteTranscription: (id) => client.delete(`/transcribe/${id}`),

  // Audio Preprocessing
  preprocessAudio: (formData) => client.post('/audio/preprocess', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAudioFeatures: (audioId) => client.get(`/audio/${audioId}/features`),

  // History
  getHistory: (params) => client.get('/history', { params }),
  deleteHistoryItem: (id) => client.delete(`/history/${id}`),

  // Datasets
  listDatasets: () => client.get('/datasets'),
  getDataset: (id) => client.get(`/datasets/${id}`),
  importDataset: (formData) => client.post('/datasets/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteDataset: (id) => client.delete(`/datasets/${id}`),

  // Research
  analyzeAcoustics: (formData) => client.post('/research/acoustic-analysis', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  runPCA: (data) => client.post('/research/pca', data),
  runTSNE: (data) => client.post('/research/tsne', data),
  compareDomains: () => client.get('/research/compare-domains'),
  getTaxonomy: () => client.get('/research/taxonomy'),

  // Training & Fine-Tuning
  getHardware: () => client.get('/training/hardware'),
  startTraining: (data) => client.post('/training/start', data),
  getTrainingStatus: (id) => client.get(`/training/status/${id}`),
  stopTraining: (id) => client.post(`/training/stop/${id}`),
  listCheckpoints: () => client.get('/training/checkpoints'),

  // Evaluation
  runEvaluation: (data) => client.post('/evaluation/run', data),
  runBatchEvaluation: (data) => client.post('/evaluation/batch', data),
  listEvaluations: () => client.get('/evaluation/results'),
  deleteEvaluation: (id) => client.delete(`/evaluation/${id}`),

  // Reports
  generateReport: (data) => client.post('/reports/generate', data),
  getReportDownloadUrl: (id) => `/api/reports/${id}/download`,

  // System
  getSystemStatus: () => client.get('/system/status'),
  getSystemResources: () => client.get('/system/resources'),
};
