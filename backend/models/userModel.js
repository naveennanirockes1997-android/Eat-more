import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
   
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    minlength: 8,
    select: false,
  },
  googleId:{type:String},
  passwordId:{type:String,
    minlength: 8,
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'staff'],
    default: 'customer',
  },
  savedAddresses: [
    {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    }
  ],
  passwordResetToken: String,
  passwordResetExpires: Date,
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Instance method to check password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

export default User;
