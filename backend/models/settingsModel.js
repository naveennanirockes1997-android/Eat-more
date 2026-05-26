import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  aboutUsText: {
    type: String,
    default: "EatMore is a premium dining platform dedicated to delivering culinary excellence right to your doorstep. We believe in fresh ingredients, bold flavors, and seamless experiences."
  },
  contactEmail: {
    type: String,
    default: "support@eatmore.com"
  },
  contactPhone: {
    type: String,
    default: "+1 (555) 123-4567"
  },
  contactAddress: {
    type: String,
    default: "123 Culinary Avenue, Food District, NY 10012"
  }
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
