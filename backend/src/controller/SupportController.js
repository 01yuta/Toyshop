const SupportMessage = require('../models/SupportMessageModel');

const normalizeConversationId = (value, fallback) => {
  if (value && typeof value === 'string') {
    return value.trim().toLowerCase();
  }
  if (fallback && typeof fallback === 'string') {
    return fallback.trim().toLowerCase();
  }
  return null;
};

const createMessage = async (req, res) => {
  try {
    const { message, conversationId, senderName, senderEmail, orderId } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const isAdmin = req.user?.isAdmin;
    const userEmail = req.user?.email;
    const userName = req.user?.username;

    if (!isAdmin && !userEmail) {
      return res.status(400).json({
        message: 'User email is required. Please ensure you are logged in correctly.',
      });
    }

    const finalConversationId = normalizeConversationId(
      conversationId,
      isAdmin ? senderEmail : userEmail || senderEmail
    );

    if (!finalConversationId) {
      return res.status(400).json({
        message: 'Unable to determine conversation ID. Please ensure you are logged in correctly.',
      });
    }

    const doc = await SupportMessage.create({
      conversationId: finalConversationId,
      senderType: isAdmin ? 'admin' : 'customer',
      senderName: isAdmin ? senderName || userName || 'Admin' : userName || senderName || 'Khách hàng',
      senderEmail: isAdmin ? senderEmail?.toLowerCase() : (userEmail || senderEmail)?.toLowerCase(),
      message: message.trim(),
      orderId: orderId || null,
      isRead: isAdmin,
    });

    return res.status(201).json(doc);
  } catch (error) {
    console.error('createMessage error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getConversations = async (req, res) => {
  try {
    const conversations = await SupportMessage.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$message' },
          lastMessageAt: { $first: '$createdAt' },
          lastSender: { $first: '$senderType' },
          customerEmail: {
            $first: {
              $cond: [
                { $eq: ['$senderType', 'customer'] },
                '$senderEmail',
                null,
              ],
            },
          },
          customerName: {
            $first: {
              $cond: [
                { $eq: ['$senderType', 'customer'] },
                '$senderName',
                null,
              ],
            },
          },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$senderType', 'customer'] }, { $eq: ['$isRead', false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { lastMessageAt: -1 } },
    ]);

    return res.json(conversations);
  } catch (error) {
    console.error('getConversations error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'conversationId is required' });
    }
    const conversationId = id.trim().toLowerCase();

    const messages = await SupportMessage.find({ conversationId }).sort({
      createdAt: 1,
    });

    if (req.user?.isAdmin) {
      await SupportMessage.updateMany(
        { conversationId, senderType: 'customer', isRead: false },
        { isRead: true }
      );
    }

    return res.json(messages);
  } catch (error) {
    console.error('getMessages error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getMyMessages = async (req, res) => {
  try {
    const userEmail = req.user?.email;
    if (!userEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const conversationId = normalizeConversationId(null, userEmail);

    const messages = await SupportMessage.find({ conversationId }).sort({
      createdAt: 1,
    });

    return res.json(messages);
  } catch (error) {
    console.error('getMyMessages error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createMessage,
  getConversations,
  getMessages,
  getMyMessages,
};

