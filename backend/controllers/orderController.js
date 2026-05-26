import Order from '../models/orderModel.js';

// 1. Create a new order (User)
export const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, deliveryAddress, paymentMethod, isScheduled, scheduledDate, scheduledTime } = req.body;

    if (!items || items.length === 0 || !totalAmount || !deliveryAddress) {
      return res.status(400).json({
        status: 'fail',
        message: 'Order items, total amount, and delivery address are required'
      });
    }

    const newOrder = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      deliveryAddress,
      paymentMethod: paymentMethod || 'Card',
      paymentStatus: 'Paid', // Assuming payment is processed on frontend
      orderStatus: 'Pending',
      isScheduled: isScheduled || false,
      scheduledDate: scheduledDate || null,
      scheduledTime: scheduledTime || null
    });

    // Populate user info (just name & email)
    const populatedOrder = await Order.findById(newOrder._id).populate('user', 'name email');

    // Emit socket.io real-time event to notify admin dashboard
    const io = req.app.get('socketio');
    if (io) {
      io.emit('newOrder', populatedOrder);
      console.log('📢 Socket emitted newOrder event:', populatedOrder._id);
    }

    res.status(201).json({
      status: 'success',
      data: {
        order: populatedOrder
      }
    });
  } catch (err) {
    console.error('Create Order Error:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// 2. Get my orders (User)
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: orders
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch your orders'
    });
  }
};

// 3. Get all orders (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: orders
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch all orders'
    });
  }
};

// 4. Update order status (Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid order status'
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { returnDocument: 'after', runValidators: true }
    ).populate('user', 'name email');

    if (!updatedOrder) {
      return res.status(404).json({
        status: 'fail',
        message: 'No order found with that ID'
      });
    }

    // Emit socket.io event for order updates
    const io = req.app.get('socketio');
    if (io) {
      io.emit('orderStatusUpdated', updatedOrder);
      console.log('📢 Socket emitted orderStatusUpdated event:', updatedOrder._id);
    }

    res.status(200).json({
      status: 'success',
      data: {
        order: updatedOrder
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// 5. Delete/Cancel order (Admin)
export const deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
      return res.status(404).json({
        status: 'fail',
        message: 'No order found with that ID'
      });
    }

    // Emit socket.io event for order deletion
    const io = req.app.get('socketio');
    if (io) {
      io.emit('orderDeleted', req.params.id);
      console.log('📢 Socket emitted orderDeleted event:', req.params.id);
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// 6. Cancel order (User - only if Pending)
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        status: 'fail',
        message: 'No order found with that ID'
      });
    }

    // Verify ownership
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to cancel this order'
      });
    }

    // Verify order is still Pending
    if (order.orderStatus !== 'Pending') {
      return res.status(400).json({
        status: 'fail',
        message: 'Order cannot be cancelled as it is already being processed or delivered'
      });
    }

    order.orderStatus = 'Cancelled';
    await order.save();

    // Emit socket.io status update to admin
    const io = req.app.get('socketio');
    if (io) {
      io.emit('orderStatusUpdated', order);
      console.log('📢 Socket emitted orderStatusUpdated (Cancelled) event:', order._id);
    }

    res.status(200).json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
