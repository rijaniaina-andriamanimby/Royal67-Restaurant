import axios from 'axios'

const baseURL = "http://localhost:8000/"
const api = axios.create({
  baseURL: baseURL, // adapte si besoin
  headers: { 'Content-Type': 'application/json' },
});

export default api