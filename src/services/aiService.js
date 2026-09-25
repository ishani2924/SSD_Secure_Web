import api from '../utils/api';

const aiService = {
  suggestStaffForResource: async (resourceId) => {
    const response = await api.get(`/ai/suggest/staff/${resourceId}`);
    return response.data;
  },
  searchResources: async (query) => {
    const response = await api.post('/ai/search/resources', { query });
    return response.data;
  },
  suggestUserAction: async (kycStatus, assetDetails) => {
    const response = await api.post('/ai/suggest/action', { kycStatus, assetDetails });
    return response.data;
  }
};

export default aiService;
