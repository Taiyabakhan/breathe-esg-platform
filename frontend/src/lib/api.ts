import axios from 'axios';

// const API_BASE = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api';
const API_BASE = "https://breathe-esg-platform-2q45.onrender.com";

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchTenants = () => api.get('/tenants/').then(res => res.data);
export const fetchUploads = () => api.get('/uploads/').then(res => res.data);
export const fetchRecords = () => api.get('/records/').then(res => res.data);

export const uploadSAPData = (tenantId: number, file: File) => {
  const formData = new FormData();
  formData.append('tenant_id', tenantId.toString());
  formData.append('file', file);
  return api.post('/ingest/sap/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data);
};

export const uploadUtilityData = (tenantId: number, file: File) => {
  const formData = new FormData();
  formData.append('tenant_id', tenantId.toString());
  formData.append('file', file);
  return api.post('/ingest/utility/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data);
};

export const uploadTravelData = (tenantId: number, jsonPayload: any) => {
  return api.post('/ingest/travel/', {
    tenant_id: tenantId,
    expenses: jsonPayload
  }).then(res => res.data);
};

export const updateRecord = (id: number, data: any) => {
  return api.patch(`/records/${id}/`, data).then(res => res.data);
};

export const bulkApproveRecords = (recordIds: number[]) => {
  return api.post('/records/bulk_approve/', { record_ids: recordIds }).then(res => res.data);
};
