// models/Wishlist.js  (or call it FavoriteList)
import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [
      {
        mediaId: { type: Number, required: true },
        mediaType: {
          type: String,
          enum: ['anime', 'manga', 'manhwa', 'show', 'book'],
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
        // Optional future fields: priority, note, etc.
      },
    ],
  },
  { timestamps: true }
);

wishlistSchema.index({ user: 1 });

export default mongoose.model('Wishlist', wishlistSchema);