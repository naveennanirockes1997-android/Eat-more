import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'An order must belong to a user']
  },
  items: [
    {
      itemID: { type: String, required: true },
      itemName: { type: String, required: true },
      itemPrice: { type: Number, required: true },
      imageUrl: { type: String },
      category: { type: String },
      quantity: { type: Number, required: true, default: 1 },
      totalPrice: { type: Number, required: true }
    }
  ],
  totalAmount: {
    type: Number,
    required: [true, 'An order must have a total amount']
  },
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    default: 'Card'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Paid'
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  isScheduled: {
    type: Boolean,
    default: false
  },
  scheduledDate: {
    type: String,
    default: null
  },
  scheduledTime: {
    type: String,
    default: null
  }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

export default Order;
