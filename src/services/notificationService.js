import axios from 'axios';
import { logApiCall, logError } from '../middleware/logger';

// Try to read an access token from localStorage. Do not hardcode a placeholder.
let ACCESS_TOKEN = null;
try {
  ACCESS_TOKEN = localStorage.getItem('affordmed_access_token') || localStorage.getItem('access_token') || null;
  if (ACCESS_TOKEN && ACCESS_TOKEN.includes('...')) {
    ACCESS_TOKEN = null;
  }
} catch (e) {
  ACCESS_TOKEN = null;
}

const apiClient = axios.create({
  baseURL: 'http://4.224.186.213/evaluation-service',
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  config.headers = {
    ...config.headers,
  };

  // Only attach Authorization when we have a non-placeholder token
  if (ACCESS_TOKEN) {
    config.headers.Authorization = `Bearer ${ACCESS_TOKEN}`;
  }

  logApiCall('API request started', {
    url: config.url,
    params: config.params,
    method: config.method,
  });

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    logApiCall('API response received', {
      url: response.config.url,
      status: response.status,
    });

    return response;
  },
  (error) => {
    logError('API request failed', error);
    return Promise.reject(error);
  }
);

const getNotifications = async ({ limit, page, notification_type }) => {
  const params = { limit, page };

  if (notification_type) {
    params.notification_type = notification_type;
  }

  try {
    const response = await apiClient.get('/notifications', { params });
    if (response.data && Array.isArray(response.data.data)) {
      return response.data;
    }
    return { data: response.data };
  } catch (error) {
    // If auth failed, retry once without Authorization header (minimum change to allow public APIs)
    if (error?.response && (error.response.status === 401 || error.response.status === 403)) {
      try {
        const url = `${apiClient.defaults.baseURL.replace(/\/$/, '')}/notifications`;
        const raw = await axios.get(url, { params, timeout: apiClient.defaults.timeout });
        if (raw.data && Array.isArray(raw.data.data)) {
          return raw.data;
        }
        return { data: raw.data };
      } catch (err2) {
        logError('Retry without auth failed', err2);
        throw error;
      }
    }

    throw error;
  }
};

const notificationService = {
  getNotifications,
};

export default notificationService;