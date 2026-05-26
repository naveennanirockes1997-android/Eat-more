import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A cart must belong to a user'],
    unique: true
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
    required: true,
    default: 0
  },
  totalQuantity: {
    type: Number,
    required: true,
    default: 0
  }
}, { timestamps: true });

// Pre-save middleware to calculate totalQuantity and totalAmount
cartSchema.pre('save', function(next) {
  this.totalQuantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.totalAmount = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  next();
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
