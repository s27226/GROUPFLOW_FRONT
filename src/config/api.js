// API Configuration
export const API_CONFIG = {
  GRAPHQL_ENDPOINT: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  WS_ENDPOINT: process.env.REACT_APP_WS_URL || 'ws://localhost:5000/graphql'
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};