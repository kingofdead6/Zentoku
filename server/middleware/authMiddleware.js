// middleware/authMiddleware.js
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

export const protect = asyncHandler(async (req, res, next) => {
  // For simplicity: expecting userId in body or header
  // In production → use JWT!
  const userId = req.body?.userId || req.headers['x-user-id'];

  if (!userId) {
    res.status(401);
    throw new Error('Not authorized - no user ID');
  }

  const user = await User.findById(userId).select('-password');

  if (!user) {
    res.status(401);
    throw new Error('User not found');
  }

  req.user = user;          // attach full user
  req.userId = user._id;    // also id
  next();
});