import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import http from 'http';
import dns from 'dns';

import passport from 'passport';
import './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import * as authController from './controllers/authController.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import User from './models/userModel.js';

dns.setServers(['8.8.8.8', '8.8.4.4']); // Use Google DNS
dotenv.config();

const app = express();
const server = http.createServer(app);
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175"
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store socket.io instance globally in the express app
app.set('socketio', io);

const PORT = Number(process.env.PORT) || 5000;

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Google OAuth Root Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), authController.googleOAuthSuccess);

// Routes
app.use('/api/v1/users', authRoutes);
app.use('/api/v1/menu', menuRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/payment', paymentRoutes);

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Basic Route
app.get('/', (req, res) => {
  res.send('EatMore API is running...');
});

// Seed Default Admin User
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@eatmore.com' });
    if (!adminExists) {
      await User.create({
        name: 'EatMore Admin',
        email: 'admin@eatmore.com',
        password: 'password123',
        role: 'admin'
      });
      console.log('👤 Seeded default admin account: admin@eatmore.com / password123');
    } else {
      console.log('👤 Admin account already exists, skipping seed.');
    }
  } catch (err) {
    console.error('Error seeding admin user:', err);
  }
};

// MongoDB Connection
const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/eatmore';

mongoose.connect(dbURI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  })
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log(`Connected to: ${dbURI.split('@')[1] ? dbURI.split('@')[1].split('/')[0].split('?')[0] : dbURI}`);
    seedAdmin(); // Run admin seed
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:');
    console.error(err);
    console.log('\nTip: Ensure your IP address is whitelisted in MongoDB Atlas and the credentials are correct.');
  });

const startServer = () => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${PORT} already in use. Falling back to a random free port.`);
      server.listen(0, () => {
        const assignedPort = server.address().port;
        console.log(`Server running on fallback port ${assignedPort}`);
      });
    } else {
      console.error('Server error:', err);
    }
  });
};

startServer();

