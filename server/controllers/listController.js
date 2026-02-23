import asyncHandler from 'express-async-handler';
import Watchlist from '../models/Watchlist.js';
import Favoritelist from '../models/FavoritesList.js';
import Wishlist from '../models/Wishlist.js';
import WatchingList from '../models/WatchingList.js';



const getOrCreateList = async (Model, userId) => {
  let list = await Model.findOne({ user: userId });
  if (!list) {
    list = await Model.create({ user: userId, items: [] });
  }
  return list;
};

const isSameMedia = (item, mediaId, mediaType) => {
  return String(item.mediaId) === String(mediaId) && item.mediaType === mediaType;
};


//Favorite List Controllers

export const addToFavoritelist = asyncHandler(async (req, res) => {
  const { mediaId, mediaType } = req.body;

  if (!mediaId || !mediaType) {
    res.status(400);
    throw new Error('mediaId and mediaType are required');
  }

  const favoritelist = await getOrCreateList(Favoritelist, req.userId);

  const alreadyExists = favoritelist.items.some(item => 
    isSameMedia(item, mediaId, mediaType)
  );

  if (alreadyExists) {
    return res.status(200).json({
      success: true,
      message: 'Already in favoritelist',
      favoritelist: favoritelist.items,
    });
  }

  favoritelist.items.push({ mediaId, mediaType });
  await favoritelist.save();

  res.json({ success: true, favoritelist: favoritelist.items });
});

export const removeFromFavoritelist = asyncHandler(async (req, res) => {
  const { mediaId, mediaType } = req.body;

  const favoritelist = await Favoritelist.findOne({ user: req.userId });
  if (!favoritelist) {
    return res.json({ success: true, favoritelist: [] });
  }

  favoritelist.items = favoritelist.items.filter(item => 
    !isSameMedia(item, mediaId, mediaType)
  );

  await favoritelist.save();

  res.json({ success: true, favoritelist: favoritelist.items });
});

export const getFavoritelist = asyncHandler(async (req, res) => {
  const favoritelist = await Favoritelist.findOne({ user: req.userId });
  res.json({
    success: true,
    favoritelist: favoritelist ? favoritelist.items : [],
  });
});


// Watched List Controllers 
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

// WishList Controllers 

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
      wishlist: wishlist  .items,
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

// Watching Controllers 

export const addToWatchingList = asyncHandler(async (req, res) => {
  const { mediaId, mediaType } = req.body;

  if (!mediaId || !mediaType) {
    res.status(400);
    throw new Error('mediaId and mediaType are required');
  }

  const watchinglist = await getOrCreateList(WatchingList, req.userId);

  const alreadyExists = watchinglist.items.some(item => 
    isSameMedia(item, mediaId, mediaType)
  );

  if (alreadyExists) {
    return res.status(200).json({
      success: true,
      message: 'Already in watching list',
      watching: watching.items,
    });
  }

  watchinglist.items.push({ mediaId, mediaType });
  await watchinglist.save();

  res.json({ success: true, watching: watchinglist.items });
});

export const removeFromWatching = asyncHandler(async (req, res) => {
  const { mediaId, mediaType } = req.body;

  const watchinglist = await WatchingList.findOne({ user: req.userId });
  if (!watchinglist) {
    return res.json({ success: true, watching: [] });
  }

  watchinglist.items = watchinglist.items.filter(item => 
    !isSameMedia(item, mediaId, mediaType)
  );

  await watchinglist.save();

  res.json({ success: true, watching: watchinglist.items });
});

export const getWatching = asyncHandler(async (req, res) => {
  const watchinglist = await WatchingList.findOne({ user: req.userId });
  res.json({
    success: true,
    watching: watchinglist ? watchinglist.items : [],
  });
});