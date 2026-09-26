import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15_000,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true // Enable cookies for cross-origin requests
});

// VULNERABILITY 6: Sensitive Information in URL (Token Leakage) - FIXED: Now using httpOnly cookies instead of localStorage
// Removed Authorization header injection since cookies are handled automatically by the browser

export default api;
