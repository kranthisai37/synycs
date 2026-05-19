import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Add a request interceptor to include the token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Add a response interceptor to self-heal from 401 Unauthorized (expired/stale tokens)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Stale or expired authentication token detected! Clearing local credentials.");
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('fullName');
      // Dispatch update to sync any open tabs
      window.dispatchEvent(new Event('userLoggedOut'));
      window.dispatchEvent(new Event('userProfileUpdated'));
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export const videoService = {
  getProjects: async () => {
    const response = await axios.get(`${API_BASE_URL}/videos/`);
    return response.data;
  },
  
  createProject: async (projectData) => {
    const response = await axios.post(`${API_BASE_URL}/videos/`, projectData);
    return response.data;
  },
  
  getProject: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/videos/${id}/`);
    return response.data;
  },

  updateProject: async (id, projectData) => {
    const response = await axios.patch(`${API_BASE_URL}/videos/${id}/`, projectData);
    return response.data;
  },

  deleteProject: async (id) => {
    console.log(`DEBUG: Sending DELETE request for project ${id}`);
    try {
      const response = await axios.delete(`${API_BASE_URL}/videos/${id}/`);
      console.log(`DEBUG: DELETE successful for project ${id}`, response);
      return true;
    } catch (err) {
      console.error(`DEBUG: DELETE failed for project ${id}`, err);
      throw err;
    }
  },

  uploadNotes: async (formData) => {
    const response = await axios.post(`${API_BASE_URL}/videos/upload_notes/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  generateScript: async (notes, directorsNotes = '') => {
    const response = await axios.post(`${API_BASE_URL}/videos/generate_script/`, { 
      notes,
      directors_notes: directorsNotes 
    });
    return response.data;
  },
  
  getStats: async () => {
    const response = await axios.get(`${API_BASE_URL}/videos/stats/`);
    return response.data;
  },

  getQueue: async () => {
    const response = await axios.get(`${API_BASE_URL}/videos/queue/`);
    return response.data;
  },

  shareProject: async (id) => {
    const response = await axios.post(`${API_BASE_URL}/videos/${id}/share/`);
    return response.data;
  }
};

export default videoService;
