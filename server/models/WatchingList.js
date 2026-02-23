// models/WatchingList.js   → Currently Watching (NEW)
import mongoose from 'mongoose';

const watchingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  items: [{
    mediaId: { type: String, required: true },
    mediaType: { 
      type: String, 
      enum: ['anime', 'manga', 'manhwa', 'show', 'book'],
      required: true 
    },
    addedAt: { type: Date, default: Date.now },
    // Optional: progress tracking (very useful for "Watching")
    progress: {
      type: Number,          // e.g. episodes watched / total
      default: 0,
    },
    totalCount: Number,      // episodes/chapters total (optional)
  }],
}, { timestamps: true });

export default mongoose.model('WatchingList', watchingSchema);