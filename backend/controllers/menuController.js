import axios from 'axios';
import FoodItem from '../models/foodModel.js';

// Get baseline categories helper function
const getCategory = (itemName) => {
  const name = itemName.toLowerCase();
  if (name.includes('biryani') || name.includes('pulav') || name.includes('rice')) return 'Rice & Biryani';
  if (name.includes('kebab') || name.includes('tikka') || name.includes('fry') || name.includes('grilled')) return 'Starters & Grills';
  if (name.includes('curry') || name.includes('makhani') || name.includes('masala') || name.includes('korma') || name.includes('jhol') || name.includes('mangsho')) return 'Main Course';
  if (name.includes('dessert') || name.includes('sweet') || name.includes('baklava') || name.includes('jamun') || name.includes('ghevar') || name.includes('doi') || name.includes('kulfi')) return 'Desserts';
  if (name.includes('coffee') || name.includes('lassi') || name.includes('brew') || name.includes('drink')) return 'Beverages';
  if (name.includes('pizza') || name.includes('pasta') || name.includes('burger')) return 'Fast Food';
  return 'Other Delicacies';
};

// 1. Get all menu items (with auto-seeding if empty)
export const getMenuItems = async (req, res) => {
  try {
    // Check if we have items in our DB
    let items = await FoodItem.find().sort({ createdAt: -1 });

    if (items.length === 0) {
      console.log('Seeding MongoDB with external restaurant API data...');
      try {
        const response = await axios.get('https://fakerestaurantapi.runasp.net/api/Restaurant/items');
        const apiData = response.data;
        
        // Map and save baseline data
        const itemsToInsert = apiData.map(item => ({
          itemID: item.itemID || `item_${Math.random().toString(36).substr(2, 9)}`,
          itemName: item.itemName,
          itemPrice: item.itemPrice,
          imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400',
          itemDescription: item.itemDescription || 'Chef-recommended gourmet meal.',
          category: getCategory(item.itemName),
          isAvailable: true
        }));

        await FoodItem.insertMany(itemsToInsert);
        items = await FoodItem.find().sort({ createdAt: -1 });
        console.log(`✅ Successfully seeded ${items.length} items to MongoDB.`);
      } catch (seedErr) {
        console.error('Failed to seed DB from external API, serving empty/default array:', seedErr.message);
      }
    }

    res.status(200).json({
      status: 'success',
      results: items.length,
      data: items
    });
  } catch (err) {
    console.error('Error fetching menu:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch menu items'
    });
  }
};

// 2. Create new menu item (Admin)
export const createMenuItem = async (req, res) => {
  try {
    const { itemName, itemPrice, imageUrl, itemDescription, category, isAvailable } = req.body;

    if (!itemName || !itemPrice || !category) {
      return res.status(400).json({
        status: 'fail',
        message: 'Name, price, and category are required'
      });
    }

    const newItem = await FoodItem.create({
      itemID: `item_${Date.now()}`,
      itemName,
      itemPrice: Number(itemPrice),
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400',
      itemDescription: itemDescription || 'Chef-recommended gourmet meal.',
      category,
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });

    res.status(201).json({
      status: 'success',
      data: {
        item: newItem
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// 3. Update menu item (Admin)
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params; // Mongo DB ID or itemID string
    
    // Find by _id or by itemID
    let item = await FoodItem.findOne({ $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { itemID: id }] });

    if (!item) {
      return res.status(404).json({
        status: 'fail',
        message: 'Menu item not found'
      });
    }

    // Apply updates
    const fieldsToUpdate = ['itemName', 'itemPrice', 'imageUrl', 'itemDescription', 'category', 'isAvailable'];
    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'itemPrice') {
          item[field] = Number(req.body[field]);
        } else {
          item[field] = req.body[field];
        }
      }
    });

    const updatedItem = await item.save();

    res.status(200).json({
      status: 'success',
      data: {
        item: updatedItem
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// 4. Delete menu item (Admin)
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete by _id or by itemID
    const deletedItem = await FoodItem.findOneAndDelete({ $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { itemID: id }] });

    if (!deletedItem) {
      return res.status(404).json({
        status: 'fail',
        message: 'Menu item not found'
      });
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
