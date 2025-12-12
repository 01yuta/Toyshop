const express = require('express');
const {
  createMessage,
  getConversations,
  getMessages,
  getMyMessages,
} = require('../controller/SupportController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/messages', authMiddleware, createMessage);
router.get('/conversations', authMiddleware, adminMiddleware, getConversations);
router.get('/conversations/:id/messages', authMiddleware, adminMiddleware, getMessages);
router.get('/my/messages', authMiddleware, getMyMessages);

module.exports = router;

