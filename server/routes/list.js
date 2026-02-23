// routes/list.js
import express from 'express';
import {
  addToFavoritelist,
  removeFromFavoritelist,
  getFavoritelist,
  addToWatched,
  removeFromWatched,
  getWatched,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  removeFromWatching,
  getWatching,
  addToWatchingList,
} from '../controllers/listController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); 

router.post('/favoritelist', addToFavoritelist);
router.delete('/favoritelist', removeFromFavoritelist);
router.get('/favoritelist', getFavoritelist);

router.post('/watched', addToWatched);
router.delete('/watched', removeFromWatched);
router.get('/watched', getWatched);

router.post('/wishlist', addToWishlist);
router.delete('/wishlist', removeFromWishlist);
router.get('/wishlist', getWishlist);

router.post('/watching', addToWatchingList);
router.delete('/watching', removeFromWatching);
router.get('/watching', getWatching);

export default router;