// routes/list.js
import express from 'express';
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  addToWatched,
  removeFromWatched,
  getWatched,
} from '../controllers/listController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // all routes require auth

router.post('/wishlist', addToWishlist);
router.delete('/wishlist', removeFromWishlist);
router.get('/wishlist', getWishlist);

router.post('/watched', addToWatched);
router.delete('/watched', removeFromWatched);
router.get('/watched', getWatched);

export default router;