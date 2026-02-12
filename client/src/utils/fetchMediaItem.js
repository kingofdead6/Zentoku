// src/utils/fetchMediaItem.js
import axios from 'axios';

export const fetchMediaItem = async (mediaType, mediaId) => {
  try {
    if (mediaType === 'anime') {
      const res = await axios.get(`https://api.jikan.moe/v4/anime/${mediaId}`);
      const a = res.data.data;
      return {
        type: 'anime',
        count: a.episodes || 0,
      };
    }

    if (mediaType === 'manga' || mediaType === 'manhwa') {
      const res = await axios.get(`https://api.jikan.moe/v4/manga/${mediaId}`);
      const m = res.data.data;
      return {
        type: 'manga',
        count: m.chapters || 0,
      };
    }

    if (mediaType === 'show') {
      const res = await axios.get(`https://api.tvmaze.com/shows/${mediaId}`);
      const s = res.data;
      return {
        type: 'show',
        count: s.runtime || 0, // minutes per episode
      };
    }

    if (mediaType === 'book') {
      return { type: 'book', count: 1 };
    }

    return { type: mediaType, count: 0 };
  } catch (err) {
    return { type: mediaType, count: 0 };
  }
};