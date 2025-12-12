const mongoose = require("mongoose");
const Order = require("../models/OrderModel");
const Product = require("../models/ProductModel");

const getStatusLabel = (status) => {
  const labels = {
    'pending': 'Chờ xử lý',
    'preparing': 'Đang chuẩn bị',
    'shipping': 'Đang giao',
    'delivered': 'Đã giao',
    'returning_pickup': 'Đang lấy hàng',
    'returning_shipping': 'Đang trả về',
    'returned': 'Đã hoàn hàng'
  };
  return labels[status] || status;
};

const deductOrderStockOnPayment = async (order) => {
  try {
    if (order.stockDeducted) {
      return;
    }

    if (!order.orderItems || order.orderItems.length === 0) {
      return;
    }

    for (const item of order.orderItems) {
      let productId = item.product;
      
      if (!productId) {
        continue;
      }

      if (typeof productId === 'string') {
        productId = productId.trim();
        if (!mongoose.Types.ObjectId.isValid(productId)) {
          continue;
        }
        productId = new mongoose.Types.ObjectId(productId);
      }

      const product = await Product.findById(productId);
      if (!product) {
        continue;
      }

      const qty = item.qty || 0;
      const oldStock = product.stock || 0;
      
      if (oldStock < qty) {
        continue;
      }

      const newStock = oldStock - qty;
      product.stock = newStock;
      await product.save();
    }

    order.stockDeducted = true;
    await order.save();
  } catch (error) {
    console.error("❌ Error deducting stock on payment:", error);
    console.error("Error stack:", error.stack);
  }
};

const restoreOrderStock = async (order) => {
  try {
    if (!order.stockDeducted) {
      return;
    }

    if (!order.orderItems || order.orderItems.length === 0) {
      return;
    }

    for (const item of order.orderItems) {
      let productId = item.product;
      
      if (!productId) {
        continue;
      }

      if (typeof productId === 'string') {
        productId = productId.trim();
        if (!mongoose.Types.ObjectId.isValid(productId)) {
          continue;
        }
        productId = new mongoose.Types.ObjectId(productId);
      }

      const product = await Product.findById(productId);
      if (!product) {
        continue;
      }

      const qty = item.qty || 0;
      const oldStock = product.stock || 0;
      product.stock = oldStock + qty;
      await product.save();
    }

    order.stockDeducted = false;
    await order.save();
  } catch (error) {
    console.error("❌ Error restoring stock:", error);
    console.error("Error stack:", error.stack);
  }
};

const deductOrderStock = async (order) => {
  try {
    if (!order.orderItems || order.orderItems.length === 0) {
      return;
    }

    for (const item of order.orderItems) {
      let productId = item.product;
      
      if (!productId) {
        continue;
      }

      if (typeof productId === 'string') {
        productId = productId.trim();
        if (!mongoose.Types.ObjectId.isValid(productId)) {
          continue;
        }
        productId = new mongoose.Types.ObjectId(productId);
      }

      const product = await Product.findById(productId);
      if (!product) {
        continue;
      }

      const qty = item.qty || 0;
      const oldStock = product.stock || 0;
      const newStock = Math.max(0, oldStock - qty);
      product.stock = newStock;
      await product.save();
    }
  } catch (error) {
    console.error("❌ Error deducting stock:", error);
    console.error("Error stack:", error.stack);
  }
};

exports.createOrder = async (req, res) => {
  try {
    const {
      userId,
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentResult,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "Thiếu userId" });
    }

    if (!orderItems || orderItems.length === 0) {
      return res
        .status(400)
        .json({ message: "Order items không được để trống" });
    }

    const normalizeProductId = (value) => {
      if (value === null || value === undefined) return "";
      return String(value).trim();
    };

    const isMongoObjectId = (value) =>
      typeof value === "string" &&
      /^[a-fA-F0-9]{24}$/.test(value) &&
      mongoose.Types.ObjectId.isValid(value);

    const sanitizedItems = orderItems.map((item) => ({
      ...item,
      product: normalizeProductId(item.product),
    }));

    for (const item of sanitizedItems) {
      if (!isMongoObjectId(item.product)) {
        continue;
      }

      const product = await Product.findById(item.product);
      if (!product) {
        return res
          .status(400)
          .json({ message: `Product không tồn tại: ${item.name}` });
      }

      if (product.stock < item.qty) {
        return res
          .status(400)
          .json({ message: `Không đủ hàng cho sản phẩm: ${item.name}` });
      }
    }

    const isPaid = paymentMethod === "CARD" ? true : false;
    
    const order = await Order.create({
      user: userId,
      orderItems: sanitizedItems,
      shippingAddress,
      paymentMethod,
      paymentResult: paymentResult || undefined,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      isPaid: isPaid,
      paidAt: isPaid ? new Date() : null,
      stockDeducted: false,
      deliveryStatus: 'pending',
    });

    if (isPaid) {
      await deductOrderStockOnPayment(order);
    }

    return res.status(201).json({
      message: "Order created successfully",
      data: order,
    });
  } catch (err) {
    console.error("Create order error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ message: "Thiếu userId" });
    }

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    return res.json(orders);
  } catch (err) {
    console.error("Get my orders error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "username email"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json(order);
  } catch (err) {
    console.error("Get order by id error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    return res.json(orders);
  } catch (err) {
    console.error("Get all orders error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderUserId = order.user.toString();
    const requestUserId = req.user.id.toString();
    if (orderUserId !== requestUserId) {
      console.error("Cancel order permission denied:", {
        orderUserId,
        requestUserId,
        orderId: req.params.id
      });
      return res.status(403).json({ message: "Bạn không có quyền hủy đơn hàng này" });
    }

    if (order.isDelivered) {
      return res.status(400).json({ message: "Không thể hủy đơn hàng đã được giao" });
    }

    if (order.isCancelled) {
      return res.status(400).json({ message: "Đơn hàng đã được hủy" });
    }

    const { cancelReason } = req.body;
    if (!cancelReason || cancelReason.trim().length === 0) {
      return res.status(400).json({ message: "Vui lòng nhập lý do hủy đơn hàng" });
    }

    order.isCancelled = true;
    order.cancelReason = cancelReason.trim();
    order.cancelRequestedAt = new Date();
    order.cancelStatus = 'pending';

    await restoreOrderStock(order);

    await order.save();

    return res.json({
      message: "Yêu cầu hủy đơn hàng đã được gửi, đang chờ admin xác nhận",
      data: order,
    });
  } catch (err) {
    console.error("Cancel order error:", err);
    console.error("Error stack:", err.stack);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.returnOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderUserId = order.user.toString();
    const requestUserId = req.user.id.toString();
    if (orderUserId !== requestUserId) {
      console.error("Return order permission denied:", {
        orderUserId,
        requestUserId,
        orderId: req.params.id
      });
      return res.status(403).json({ message: "Bạn không có quyền hoàn đơn hàng này" });
    }

    if (!order.isDelivered && order.deliveryStatus !== 'delivered') {
      return res.status(400).json({ message: "Chỉ có thể hoàn đơn hàng đã được giao" });
    }

    if (!order.deliveredAt) {
      return res.status(400).json({ message: "Không thể xác định thời gian giao hàng" });
    }

    const deliveredAt = new Date(order.deliveredAt);
    const now = new Date();
    const hoursSinceDelivery = (now - deliveredAt) / (1000 * 60 * 60);
    
    if (hoursSinceDelivery > 24) {
      return res.status(400).json({ 
        message: `Chỉ có thể hoàn đơn hàng trong vòng 24 giờ kể từ khi nhận hàng. Đơn hàng đã được giao ${Math.floor(hoursSinceDelivery)} giờ trước.` 
      });
    }

    if (order.isReturnRequested) {
      return res.status(400).json({ message: "Yêu cầu hoàn đơn đã được gửi trước đó" });
    }

    if (order.isCancelled && order.cancelStatus === 'approved') {
      return res.status(400).json({ message: "Không thể hoàn đơn hàng đã bị hủy" });
    }

    const { returnReason, returnBankAccount } = req.body;
    if (!returnReason || returnReason.trim().length === 0) {
      return res.status(400).json({ message: "Vui lòng nhập lý do hoàn đơn hàng" });
    }

    if (!returnBankAccount || returnBankAccount.trim().length === 0) {
      return res.status(400).json({ message: "Vui lòng nhập số tài khoản ngân hàng để hoàn tiền" });
    }

    const bankAccountRegex = /^\d{8,20}$/;
    if (!bankAccountRegex.test(returnBankAccount.trim())) {
      return res.status(400).json({ message: "Số tài khoản ngân hàng không hợp lệ (phải là số từ 8-20 chữ số)" });
    }

    order.isReturnRequested = true;
    order.returnReason = returnReason.trim();
    order.returnBankAccount = returnBankAccount.trim();
    order.returnRequestedAt = new Date();
    order.returnStatus = 'pending';

    await order.save();

    return res.json({
      message: "Yêu cầu hoàn đơn hàng đã được gửi, đang chờ admin xác nhận",
      data: order,
    });
  } catch (err) {
    console.error("Return order error:", err);
    console.error("Error stack:", err.stack);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const { isPaid, isDelivered, cancelStatus, cancelReason, deliveryStatus, returnStatus } = req.body;

    if (order.isCancelled && order.cancelStatus === 'approved') {
      if (cancelStatus && ['approved', 'rejected'].includes(cancelStatus)) {
        return res.status(400).json({ 
          message: "Đơn hàng đã bị hủy, không thể thực hiện thao tác này" 
        });
      }
      return res.status(400).json({ 
        message: "Đơn hàng đã bị hủy, không thể cập nhật trạng thái" 
      });
    }

    if (returnStatus && ['approved', 'rejected'].includes(returnStatus)) {
      if (order.isReturnRequested) {
        const previousStatus = order.returnStatus || null;
        order.returnStatus = returnStatus;
        
        if (returnStatus === 'approved' && previousStatus !== 'approved') {
          order.returnProcessedAt = new Date();
          order.deliveryStatus = 'returning_pickup';
          order.isPaid = false;
          order.paidAt = null;
          await restoreOrderStock(order);
        }
      }
    }

    if (typeof isPaid === "boolean") {
      const wasPaid = order.isPaid;
      order.isPaid = isPaid;
      order.paidAt = isPaid ? new Date() : null;
      
      if (isPaid && !wasPaid && !order.stockDeducted) {
        await deductOrderStockOnPayment(order);
      }
      
      if (!isPaid && wasPaid && order.stockDeducted) {
        await restoreOrderStock(order);
      }
    }

    if (deliveryStatus && ['pending', 'preparing', 'shipping', 'delivered', 'returning_pickup', 'returning_shipping', 'returned'].includes(deliveryStatus)) {
      const currentStatus = order.deliveryStatus || 'pending';
      
      const normalStatusOrder = ['pending', 'preparing', 'shipping', 'delivered'];
      const returnStatusOrder = ['returning_pickup', 'returning_shipping', 'returned'];
      
      const isInNormalFlow = normalStatusOrder.includes(currentStatus);
      const isInReturnFlow = returnStatusOrder.includes(currentStatus);
      
      if (returnStatusOrder.includes(deliveryStatus) && currentStatus === 'delivered') {
        order.deliveryStatus = deliveryStatus;
      }
      else if (isInReturnFlow && returnStatusOrder.includes(deliveryStatus)) {
        const currentIndex = returnStatusOrder.indexOf(currentStatus);
        const newIndex = returnStatusOrder.indexOf(deliveryStatus);
        if (newIndex >= currentIndex) {
          order.deliveryStatus = deliveryStatus;
        } else {
          return res.status(400).json({ 
            message: `Không thể quay lại trạng thái. Trạng thái hiện tại: ${getStatusLabel(currentStatus)}, bạn đang cố chuyển sang: ${getStatusLabel(deliveryStatus)}` 
          });
        }
      }
      else if (normalStatusOrder.includes(deliveryStatus)) {
        const currentIndex = normalStatusOrder.indexOf(currentStatus);
        const newIndex = normalStatusOrder.indexOf(deliveryStatus);

        if (newIndex >= currentIndex) {
          order.deliveryStatus = deliveryStatus;
          
          if (deliveryStatus === 'delivered') {
            order.isDelivered = true;
            order.deliveredAt = new Date();
          } else if (currentStatus === 'delivered' && deliveryStatus !== 'delivered') {
            return res.status(400).json({ 
              message: "Không thể quay lại trạng thái trước khi đã giao hàng" 
            });
          }
        } else {
          return res.status(400).json({ 
            message: `Không thể quay lại trạng thái. Trạng thái hiện tại: ${getStatusLabel(currentStatus)}, bạn đang cố chuyển sang: ${getStatusLabel(deliveryStatus)}` 
          });
        }
      } else {
        return res.status(400).json({ 
          message: `Trạng thái không hợp lệ: ${deliveryStatus}` 
        });
      }
    }

    if (typeof isDelivered === "boolean" && !deliveryStatus) {
      if (isDelivered && order.deliveryStatus !== 'delivered') {
        order.deliveryStatus = 'delivered';
        order.deliveredAt = new Date();
      }
      order.isDelivered = isDelivered;
      if (!isDelivered) {
        order.deliveredAt = null;
      }
    }

    if (cancelStatus && ['approved', 'rejected'].includes(cancelStatus)) {
      if (order.isCancelled) {
        const previousStatus = order.cancelStatus || null;
        order.cancelStatus = cancelStatus;
        
        if (cancelStatus === 'approved' && previousStatus !== 'approved') {
          await restoreOrderStock(order);
        }
        
        if (cancelStatus === 'rejected' && previousStatus === 'pending' && order.isPaid && !order.stockDeducted) {
          await deductOrderStockOnPayment(order);
        }
      }
    }


    if (deliveryStatus && ['pending', 'preparing', 'shipping', 'delivered', 'returning_pickup', 'returning_shipping', 'returned'].includes(deliveryStatus)) {
      const returnJustApproved = returnStatus === 'approved' && order.returnStatus === 'approved' && order.deliveryStatus === 'returning_pickup';
      if (returnJustApproved) {
      } else {
        const currentStatus = order.deliveryStatus || 'pending';
        
        const normalStatusOrder = ['pending', 'preparing', 'shipping', 'delivered'];
        const returnStatusOrder = ['returning_pickup', 'returning_shipping', 'returned'];
        
        const isInNormalFlow = normalStatusOrder.includes(currentStatus);
        const isInReturnFlow = returnStatusOrder.includes(currentStatus);
        
        if (returnStatusOrder.includes(deliveryStatus) && currentStatus === 'delivered') {
          order.deliveryStatus = deliveryStatus;
        }
        else if (isInReturnFlow && returnStatusOrder.includes(deliveryStatus)) {
          const currentIndex = returnStatusOrder.indexOf(currentStatus);
          const newIndex = returnStatusOrder.indexOf(deliveryStatus);
          if (newIndex >= currentIndex) {
            order.deliveryStatus = deliveryStatus;
          } else {
            return res.status(400).json({ 
              message: `Không thể quay lại trạng thái. Trạng thái hiện tại: ${getStatusLabel(currentStatus)}, bạn đang cố chuyển sang: ${getStatusLabel(deliveryStatus)}` 
            });
          }
        }
        else if (normalStatusOrder.includes(deliveryStatus)) {
          const currentIndex = normalStatusOrder.indexOf(currentStatus);
          const newIndex = normalStatusOrder.indexOf(deliveryStatus);

          if (newIndex >= currentIndex) {
            order.deliveryStatus = deliveryStatus;
            
            if (deliveryStatus === 'delivered') {
              order.isDelivered = true;
              order.deliveredAt = new Date();
            } else if (currentStatus === 'delivered' && deliveryStatus !== 'delivered') {
              return res.status(400).json({ 
                message: "Không thể quay lại trạng thái trước khi đã giao hàng" 
              });
            }
          } else {
            return res.status(400).json({ 
              message: `Không thể quay lại trạng thái. Trạng thái hiện tại: ${getStatusLabel(currentStatus)}, bạn đang cố chuyển sang: ${getStatusLabel(deliveryStatus)}` 
            });
          }
        } else {
          return res.status(400).json({ 
            message: `Trạng thái không hợp lệ: ${deliveryStatus}` 
          });
        }
      }
    }

    if (cancelReason && req.user.isAdmin) {
      const wasAlreadyCancelled = order.isCancelled;
      
      order.isCancelled = true;
      order.cancelReason = cancelReason.trim();
      order.cancelRequestedAt = new Date();
      order.cancelStatus = 'approved';
      
      if (!wasAlreadyCancelled) {
        await restoreOrderStock(order);
      }
    }

    await order.save();

    return res.json({
      message: "Order updated successfully",
      data: order,
    });
  } catch (err) {
    console.error("Update order error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};