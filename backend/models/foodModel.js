import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
  itemID: {
    type: String,
    required: true,
    unique: true
  },
  itemName: {
    type: String,
    required: [true, 'Please provide the name of the food item'],
    trim: true
  },
  itemPrice: {
    type: Number,
    required: [true, 'Please provide the price of the food item']
  },
  imageUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'
  },
  itemDescription: {
    type: String,
    default: 'Chef-recommended gourmet meal.'
  },
  category: {
    type: String,
    required: [true, 'Please provide the category']
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

const FoodItem = mongoose.model('FoodItem', foodSchema);

export default FoodItem;
