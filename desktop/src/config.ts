export const getApiUrl = () => {
  return localStorage.getItem('backend_url') || 'http://127.0.0.1:8000';
};
