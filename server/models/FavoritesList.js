import mongoose from 'mongoose';

const FavoritelistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [
      {
        mediaId: { 
          type: mongoose.Schema.Types.Mixed, // Changed from Number to Mixed to support both String and Number
          required: true 
        },
        mediaType: {
          type: String,
          enum: ['anime', 'manga', 'manhwa', 'show', 'book'],
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

FavoritelistSchema.index({ user: 1 });

export default mongoose.model('Favoritelist', FavoritelistSchema);