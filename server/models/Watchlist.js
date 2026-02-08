// models/Watchlist.js
import mongoose from 'mongoose';

const watchlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one watchlist per user
    },
    items: [
      {
        mediaId: { type: Number, required: true },      // mal_id or tvmaze id or openlibrary key (as number/string)
        mediaType: {
          type: String,
          enum: ['anime', 'manga', 'manhwa', 'show', 'book'],
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
        // You can later add: status, progress, rating, note, etc.
      },
    ],
  },
  { timestamps: true }
);

// Optional index for faster queries
watchlistSchema.index({ user: 1 });

export default mongoose.model('Watchlist', watchlistSchema);