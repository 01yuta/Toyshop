import api from './axiosClient';

const unwrap = (res) => res.data;

export const fetchConversations = () =>
  api.get('/api/support/conversations').then(unwrap);

export const fetchConversationMessages = (conversationId) =>
  api.get(`/api/support/conversations/${conversationId}/messages`).then(unwrap);

export const sendSupportMessage = (payload) =>
  api.post('/api/support/messages', payload).then(unwrap);

export const fetchMySupportMessages = () =>
  api.get('/api/support/my/messages').then(unwrap);

