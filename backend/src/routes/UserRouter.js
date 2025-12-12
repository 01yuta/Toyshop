const express = require('express');
const router = express.Router();
const userController = require('../controller/UserController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.get('/me', authMiddleware, userController.getCurrentUser);
router.put('/me', authMiddleware, userController.updateCurrentUser);
router.post('/', authMiddleware, adminMiddleware, userController.createUser);
router.get('/', authMiddleware, adminMiddleware, userController.getUsers);
router.put('/:id', authMiddleware, adminMiddleware, userController.updateUser);
router.delete('/:id', authMiddleware, adminMiddleware, userController.deleteUser);

module.exports = router;
