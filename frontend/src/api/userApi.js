import api from "./axiosClient";

const unwrap = (res) => res.data;

export const fetchUsers = () => api.get("/api/users").then(unwrap);

export const updateUser = (id, payload) =>
  api.put(`/api/users/${id}`, payload).then(unwrap);

export const deleteUser = (id) =>
  api.delete(`/api/users/${id}`).then(unwrap);

export const createUser = (payload) =>
  api.post("/api/users", payload).then(unwrap);

export const getCurrentUser = () =>
  api.get("/api/users/me").then(unwrap);

export const updateCurrentUser = (payload) =>
  api.put("/api/users/me", payload).then(unwrap);

