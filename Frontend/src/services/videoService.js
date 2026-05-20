import { API_API_URL } from '../utils/apiConfig';

const API_BASE_URL = API_API_URL;

const handleUnauthorized = () => {
  console.warn("Stale or expired authentication token detected! Clearing local credentials.");
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('fullName');
  window.dispatchEvent(new Event('userLoggedOut'));
  window.dispatchEvent(new Event('userProfileUpdated'));
  window.location.reload();
};

const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Token ${token}`);
  }

  const body = options.body;
  const isFormData = body instanceof FormData;
  if (body && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body: body && !isFormData && typeof body !== 'string' ? JSON.stringify(body) : body,
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      message = data.error || data.detail || message;
    } catch {
      const text = await response.text();
      if (text) {
        message = text;
      }
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const videoService = {
  getProjects: async () => {
    return apiRequest(`${API_BASE_URL}/videos/`);
  },
  
  createProject: async (projectData) => {
    return apiRequest(`${API_BASE_URL}/videos/`, {
      method: 'POST',
      body: projectData,
    });
  },
  
  getProject: async (id) => {
    return apiRequest(`${API_BASE_URL}/videos/${id}/`);
  },

  updateProject: async (id, projectData) => {
    return apiRequest(`${API_BASE_URL}/videos/${id}/`, {
      method: 'PATCH',
      body: projectData,
    });
  },

  deleteProject: async (id) => {
    console.log(`DEBUG: Sending DELETE request for project ${id}`);
    try {
      await apiRequest(`${API_BASE_URL}/videos/${id}/`, {
        method: 'DELETE',
      });
      console.log(`DEBUG: DELETE successful for project ${id}`);
      return true;
    } catch (err) {
      console.error(`DEBUG: DELETE failed for project ${id}`, err);
      throw err;
    }
  },

  uploadNotes: async (formData) => {
    return apiRequest(`${API_BASE_URL}/videos/upload_notes/`, {
      method: 'POST',
      body: formData,
    });
  },

  generateScript: async (notes, directorsNotes = '') => {
    return apiRequest(`${API_BASE_URL}/videos/generate_script/`, {
      method: 'POST',
      body: {
        notes,
        directors_notes: directorsNotes,
      },
    });
  },
  
  getStats: async () => {
    return apiRequest(`${API_BASE_URL}/videos/stats/`);
  },

  getQueue: async () => {
    return apiRequest(`${API_BASE_URL}/videos/queue/`);
  },

  shareProject: async (id) => {
    return apiRequest(`${API_BASE_URL}/videos/${id}/share/`, {
      method: 'POST',
    });
  }
};

export default videoService;
