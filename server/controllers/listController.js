import asyncHandler from 'express-async-handler';
import Watchlist from '../models/Watchlist.js';
import Wishlist from '../models/Wishlist.js';

const getOrCreateList = async (Model, userId) => {
  let list = await Model.findOne({ user: userId });
  if (!list) {
    list = await Model.create({ user: userId, items: [] });
  }
  return list;
};

// Helper to compare mediaIds (handles both strings and numbers)
const isSameMedia = (item, mediaId, mediaType) => {
  return String(item.mediaId) === String(mediaId) && item.mediaType === mediaType;
};

// ─────────────────────────────────────────────── 
//  Wishlist (Favorites)
// ───────────────────────────────────────────────

export const addToWishlist = asyncHandler(async (req, res) => {
  const { mediaId, mediaType } = req.body;

  if (!mediaId || !mediaType) {
    res.status(400);
    throw new Error('mediaId and mediaType are required');
  }

  const wishlist = await getOrCreateList(Wishlist, req.userId);

  const alreadyExists = wishlist.items.some(item => 
    isSameMedia(item, mediaId, mediaType)
  );

  if (alreadyExists) {
    return res.status(200).json({
      success: true,
      message: 'Already in wishlist',
      wishlist: wishlist.items,
    });
  }

  wishlist.items.push({ mediaId, mediaType });
  await wishlist.save();

  res.json({ success: true, wishlist: wishlist.items });
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { mediaId, mediaType } = req.body;

  const wishlist = await Wishlist.findOne({ user: req.userId });
  if (!wishlist) {
    return res.json({ success: true, wishlist: [] });
  }

  wishlist.items = wishlist.items.filter(item => 
    !isSameMedia(item, mediaId, mediaType)
  );

  await wishlist.save();

  res.json({ success: true, wishlist: wishlist.items });
});

export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.userId });
  res.json({
    success: true,
    wishlist: wishlist ? wishlist.items : [],
  });
});

// ─────────────────────────────────────────────── 
//  Watched / Watchlist
// ───────────────────────────────────────────────

export const addToWatched = asyncHandler(async (req, res) => {
  const { mediaId, mediaType } = req.body;

  if (!mediaId || !mediaType) {
    res.status(400);
    throw new Error('mediaId and mediaType are required');
  }

  const watchlist = await getOrCreateList(Watchlist, req.userId);

  const alreadyExists = watchlist.items.some(item => 
    isSameMedia(item, mediaId, mediaType)
  );

  if (alreadyExists) {
    return res.status(200).json({
      success: true,
      message: 'Already in watched list',
      watched: watchlist.items,
    });
  }

  watchlist.items.push({ mediaId, mediaType });
  await watchlist.save();

  res.json({ success: true, watched: watchlist.items });
});

export const removeFromWatched = asyncHandler(async (req, res) => {
  const { mediaId, mediaType } = req.body;

  const watchlist = await Watchlist.findOne({ user: req.userId });
  if (!watchlist) {
    return res.json({ success: true, watched: [] });
  }

  watchlist.items = watchlist.items.filter(item => 
    !isSameMedia(item, mediaId, mediaType)
  );

  await watchlist.save();

  res.json({ success: true, watched: watchlist.items });
});

export const getWatched = asyncHandler(async (req, res) => {
  const watchlist = await Watchlist.findOne({ user: req.userId });
  res.json({
    success: true,
    watched: watchlist ? watchlist.items : [],
  });
});