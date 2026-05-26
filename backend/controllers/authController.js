import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/userModel.js';

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret-key-123', {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d',
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 90) * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  
  const host = req.headers.host || '';
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');

  if (process.env.NODE_ENV === 'production' || !isLocalhost) {
    cookieOptions.secure = true;
    cookieOptions.sameSite = 'none';
  }

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

export const signup = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role || 'customer'
    });

    createSendToken(newUser, 201, req, res);
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide email and password' });
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({ status: 'fail', message: 'Incorrect email or password' });
    }

    // 3) If everything ok, send token to client
    createSendToken(user, 200, req, res);
  } catch (err) {
    console.error('Login Error:', err);
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

export const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

// --- AUTHENTICATION & AUTHORIZATION MIDDLEWARES ---

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token || token === 'loggedout') {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in. Please log in to get access.'
      });
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key-123');

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: 'Invalid token. Please log in again.'
    });
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'You do not have permission to perform this action.'
      });
    }
    next();
  };
};

// --- ADMIN USER CONTROL CONTROLLERS ---

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: users
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch users'
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !['customer', 'admin', 'staff'].includes(role)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid role'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: 'fail',
        message: 'No user found with that ID'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({
        status: 'fail',
        message: 'No user found with that ID'
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

// --- PASSWORD RESET & PROFILE MANAGEMENT ---

export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'There is no user with that email address.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: 'Token generated successfully! In production, this would be emailed. For demo purposes, here is your token.',
      resetToken
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ status: 'fail', message: 'Token is invalid or has expired' });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, req, res);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

export const getMe = async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
};

export const updateMe = async (req, res) => {
  try {
    if (req.body.password) {
      return res.status(400).json({
        status: 'fail',
        message: 'This route is not for password updates. Please use /updateMyPassword.'
      });
    }

    const filteredBody = {};
    if (req.body.name) filteredBody.name = req.body.name;
    if (req.body.email) filteredBody.email = req.body.email;
    if (req.body.savedAddresses) filteredBody.savedAddresses = req.body.savedAddresses;

    const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

export const updateMyPassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
      return res.status(401).json({ status: 'fail', message: 'Your current password is wrong' });
    }

    user.password = req.body.newPassword;
    await user.save();

    createSendToken(user, 200, req, res);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

export const googleOAuthSuccess = (req, res) => {
  try {
    const token = signToken(req.user._id);
    const cookieOptions = {
      expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRES_IN || 90) * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };
    const host = req.headers.host || '';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
    if (process.env.NODE_ENV === 'production' || !isLocalhost) {
      cookieOptions.secure = true;
      cookieOptions.sameSite = 'none';
    }

    res.cookie('jwt', token, cookieOptions);

    let redirectUrl = req.cookies.auth_redirect_to;
    res.clearCookie('auth_redirect_to', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });

    if (!redirectUrl) {
      redirectUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    }

    res.redirect(redirectUrl);
  } catch (err) {
    console.error('Google OAuth Success Redirect Error:', err);
    let redirectUrl = req.cookies.auth_redirect_to || process.env.CLIENT_URL || 'http://localhost:5173';
    res.clearCookie('auth_redirect_to', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    res.redirect(`${redirectUrl}?error=auth_failed`);
  }
};
