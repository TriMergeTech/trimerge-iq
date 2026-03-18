import axios from 'axios';

const getBaseUrl = () => process.env.AI_ENGINE_URL || 'http://localhost:5000/api';

export const searchKnowledgeBase = async (query: string) => {
  const response = await axios.get(`${getBaseUrl()}/search`, { params: { query } });
  return response.data;
};

export const sendChatPrompt = async (prompt: string) => {
  const response = await axios.post(`${getBaseUrl()}/chat`, { prompt });
  return response.data;
};

export const forwardDocument = async (file: Express.Multer.File) => {
  // Fix: Convert Node Buffer to Uint8Array for the Web Blob API
  const blob = new Blob([new Uint8Array(file.buffer)], { type: file.mimetype });
  const formData = new FormData();
  formData.append('file', blob, file.originalname);

  const response = await axios.post(`${getBaseUrl()}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};