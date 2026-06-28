import client from './client';

export const loginAdmin = (payload) => client.post('/admins/login', payload);
export const refreshAdminToken = (payload) => client.post('/admins/refresh', payload);
export const fetchAdminProfile = () => client.get('/admins/me');
