import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.DEV
    ? 'http://localhost:8080/auth'
    : 'https://medibot-700i.onrender.com/auth',
});

export const googleAuth = (code) => api.get(`/google?code=${code}`);
