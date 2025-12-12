const express = require("express");
const router = express.Router();
const OrderController = require("../controller/OrderController");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");

router.post("/", authMiddleware, OrderController.createOrder);
router.get("/my", authMiddleware, OrderController.getMyOrders);
router.get("/:id", authMiddleware, OrderController.getOrderById);
router.get("/", authMiddleware, adminMiddleware, OrderController.getAllOrders);
router.post("/:id/cancel", authMiddleware, OrderController.cancelOrder);
router.post("/:id/return", authMiddleware, OrderController.returnOrder);
router.put(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  OrderController.updateOrderStatus
);

module.exports = router;
