import api from "./axiosClient";

const unwrap = (res) => res.data;

export const getProductReviews = (productId, params = {}) =>
  api.get(`/api/products/${productId}/reviews`, { params }).then(unwrap);

export const createProductReview = (productId, payload) =>
  api.post(`/api/products/${productId}/reviews`, payload).then(unwrap);

