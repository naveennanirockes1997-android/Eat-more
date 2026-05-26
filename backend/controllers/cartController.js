import Cart from '../models/cartModel.js';

// 1. Get or Create Cart
export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.status(200).json({
      status: 'success',
      data: cart
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

// 2. Add Item to Cart
export const addToCart = async (req, res) => {
  try {
    const { itemID, itemName, itemPrice, imageUrl, category } = req.body;

    if (!itemID || !itemName || !itemPrice) {
      return res.status(400).json({
        status: 'fail',
        message: 'Item ID, Name, and Price are required'
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(item => item.itemID === itemID);

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += 1;
      cart.items[existingItemIndex].totalPrice = cart.items[existingItemIndex].quantity * itemPrice;
    } else {
      cart.items.push({
        itemID,
        itemName,
        itemPrice,
        imageUrl,
        category,
        quantity: 1,
        totalPrice: itemPrice
      });
    }

    await cart.save();

    res.status(200).json({
      status: 'success',
      data: cart
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// 3. Remove Item from Cart (Decrement or Delete)
export const removeFromCart = async (req, res) => {
  try {
    const { itemID } = req.params;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        status: 'fail',
        message: 'Cart not found'
      });
    }

    const existingItemIndex = cart.items.findIndex(item => item.itemID === itemID);

    if (existingItemIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Item not found in cart'
      });
    }

    const item = cart.items[existingItemIndex];

    if (item.quantity > 1) {
      item.quantity -= 1;
      item.totalPrice = item.quantity * item.itemPrice;
    } else {
      cart.items.splice(existingItemIndex, 1);
    }

    await cart.save();

    res.status(200).json({
      status: 'success',
      data: cart
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// 4. Update Item Quantity Directly
export const updateCartQuantity = async (req, res) => {
  try {
    const { itemID } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid quantity'
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        status: 'fail',
        message: 'Cart not found'
      });
    }

    const existingItemIndex = cart.items.findIndex(item => item.itemID === itemID);

    if (existingItemIndex === -1) {
      return res.status(404).json({
        status: 'fail',
        message: 'Item not found in cart'
      });
    }

    if (quantity === 0) {
      cart.items.splice(existingItemIndex, 1);
    } else {
      cart.items[existingItemIndex].quantity = quantity;
      cart.items[existingItemIndex].totalPrice = quantity * cart.items[existingItemIndex].itemPrice;
    }

    await cart.save();

    res.status(200).json({
      status: 'success',
      data: cart
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// 5. Clear Cart
export const clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    } else {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.status(200).json({
      status: 'success',
      data: cart
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};
