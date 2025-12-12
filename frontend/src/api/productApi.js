import api from './axiosClient';

const unwrap = (res) => res.data;

export const fetchProducts = (params = {}) =>
  api.get('/api/products', { params }).then(unwrap);

export const fetchProductById = (id) =>
  api.get(`/api/products/${id}`).then(unwrap);

export const fetchProductReviews = (id, params = {}) =>
  api.get(`/api/products/${id}/reviews`, { params }).then(unwrap);

export const fetchRelatedProducts = (id, params = {}) =>
  api.get(`/api/products/${id}/related`, { params }).then(unwrap);

export const createProduct = (payload) =>
  api.post('/api/products', payload).then(unwrap);

export const updateProduct = (id, payload) =>
  api.put(`/api/products/${id}`, payload).then(unwrap);

export const deleteProduct = (id) =>
  api.delete(`/api/products/${id}`).then(unwrap);

