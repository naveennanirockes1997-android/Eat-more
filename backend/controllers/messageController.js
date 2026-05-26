import Message from '../models/messageModel.js';

export const submitMessage = async (req, res) => {
  try {
    const { name, email, message, rating, foodItem } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ status: 'fail', message: 'Please provide all required fields' });
    }
    
    const newMessage = await Message.create({ name, email, message, rating, foodItem });
    res.status(201).json({ status: 'success', data: newMessage });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: messages });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const updateMessage = async (req, res) => {
  try {
    const updatedMessage = await Message.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    res.status(200).json({ status: 'success', data: updatedMessage });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
