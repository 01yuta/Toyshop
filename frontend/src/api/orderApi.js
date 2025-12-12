import api from "./axiosClient";

const unwrap = (res) => res.data;

export const fetchMyOrders = (userId) =>
  api.get("/api/orders/my", { params: { userId } }).then(unwrap);

export const fetchOrderById = (id) =>
  api.get(`/api/orders/${id}`).then(unwrap);

export const updateOrderStatus = (id, payload) =>
  api.put(`/api/orders/${id}/status`, payload).then(unwrap);

export const cancelOrder = (id, cancelReason) =>
  api.post(`/api/orders/${id}/cancel`, { cancelReason }).then(unwrap);

export const returnOrder = (id, returnReason, returnBankAccount) =>
  api.post(`/api/orders/${id}/return`, { returnReason, returnBankAccount }).then(unwrap);

