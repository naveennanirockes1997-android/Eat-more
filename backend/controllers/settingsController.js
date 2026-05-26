import Settings from '../models/settingsModel.js';

export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.status(200).json({ status: 'success', data: settings });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    
    const updatedSettings = await Settings.findByIdAndUpdate(settings._id, req.body, { returnDocument: 'after', runValidators: true });
    
    res.status(200).json({ status: 'success', data: updatedSettings });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
