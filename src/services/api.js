import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Cluster Management APIs
export const getClusters = async () => {
  const response = await apiClient.get('/clusters');
  return response.data;
};

export const getClusterNodes = async (clusterName) => {
  const response = await apiClient.get(`/clusters/${clusterName}/nodes`);
  return response.data;
};

// Indexing Rate APIs
export const getIndexingRate = async (clusterName) => {
  const response = await apiClient.get(`/indexingRate/${clusterName}`);
  return response.data;
};

// Stale Indices API
export const getStaleIndices = async (clusterName, days) => {
  const response = await apiClient.get(`/staleIndices/${clusterName}/${days}`);
  return response.data;
};

// Thread Pool Write Queue APIs
export const getTPWQueueCluster = async (clusterName) => {
  const response = await apiClient.get(`/tpwqueue/${clusterName}`);
  return response.data;
};

export const getTPWQueueHost = async (clusterName, hostName) => {
  const response = await apiClient.get(`/tpwqueue/${clusterName}/${hostName}`);
  return response.data;
};

// Application Status APIs
export const getStatus = async () => {
  const response = await apiClient.get('/status');
  return response.data;
};

export const getJobs = async () => {
  const response = await apiClient.get('/jobs');
  return response.data;
};

// Job Control API
export const triggerJob = async (jobName) => {
  const response = await apiClient.post(`/jobs/${jobName}/trigger`);
  return response.data;
};

export default apiClient;
