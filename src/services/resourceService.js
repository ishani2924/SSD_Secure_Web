import api from '../utils/api';

const resourceService = {
  getAllResources: async () => {
    const response = await api.get('/resources');
    return response.data;
  },
  getResource: async (id) => {
    const response = await api.get(`/resources/${id}`);
    return response.data;
  },
  createResource: async (resourceData) => {
    const response = await api.post('/resources', resourceData);
    return response.data;
  },
  updateResource: async (id, resourceData) => {
    const response = await api.put(`/resources/${id}`, resourceData);
    return response.data;
  },
  deleteResource: async (id) => {
    const response = await api.delete(`/resources/${id}`);
    return response.data;
  }
};

export default resourceService;
