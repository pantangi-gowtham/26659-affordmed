import axios from 'axios';
import { logApiCall, logError } from '../middleware/logger';

// Paste your access_token from Postman below
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....';

const apiClient = axios.create({
  baseURL: 'http://4.224.186.213/evaluation-service',
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  config.headers = {
    ...config.headers,
    Authorization: `Bearer ${ACCESS_TOKEN}`,
  };

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

  const response = await apiClient.get('/notifications', {
    params,
  });

  if (response.data && Array.isArray(response.data.data)) {
    return response.data;
  }

  return { data: response.data };
};

const notificationService = {
  getNotifications,
};

export default notificationService;