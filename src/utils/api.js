import axios from 'axios';

/**
 * [SECURITY FIX — Vulnerability 6: Token leakage via URL/localStorage] FIXED
 * Previously tokens could be stored in localStorage or appended to URLs, leaking via
 * history, Referer headers, or XSS. Session JWTs are now sent only as httpOnly cookies
 * (set by the API); this client uses withCredentials and does not attach Authorization headers.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15_000,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

export default api;
