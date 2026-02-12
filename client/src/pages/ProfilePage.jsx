import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { NODE_API } from '../../api';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();

  const [stats, setStats] = useState({
    totalWatched: 0,
    totalFavorites: 0,
    animeCount: 0,
    mangaCount: 0,
    showCount: 0,
    bookCount: 0,
    totalUnits: 0, 
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.userId) return;

    const loadProfile = async () => {
      try {
        setLoading(true);

        const [watchedRes, favRes] = await Promise.all([
          axios.get(`${NODE_API}/list/watched`, { headers: { 'x-user-id': user.userId } }),
          axios.get(`${NODE_API}/list/wishlist`, { headers: { 'x-user-id': user.userId } }),
        ]);

        const watchedItems = watchedRes.data.watched || [];
        const favItems = favRes.data.wishlist || [];

        // Fetch full details for watched items to get accurate counts
        const watchedDetails = await Promise.all(
          watchedItems.map(async (item) => {
            try {
              return await fetchMediaDetails(item.mediaId, item.mediaType);
            } catch (err) {
              console.error(`Error fetching ${item.mediaType} ${item.mediaId}:`, err);
              return null;
            }
          })
        );

        const validWatchedItems = watchedDetails.filter(Boolean);

        // Calculate stats
        let anime = 0, manga = 0, show = 0, book = 0, units = 0;

        validWatchedItems.forEach(item => {
          if (item.type === 'anime') {
            anime++;
            units += item.count || 0;
          } else if (item.type === 'manga' || item.type === 'manhwa') {
            manga++;
            if (typeof item.count === 'number') {
              units += item.count;
            }
          } else if (item.type === 'show') {
            show++;
            units += item.count || 0;
          } else if (item.type === 'book') {
            book++;
            units += 1;
          }
        });

        setStats({
          totalWatched: watchedItems.length,
          totalFavorites: favItems.length,
          animeCount: anime,
          mangaCount: manga,
          showCount: show,
          bookCount: book,
          totalUnits: units,
        });
      } catch (err) {
        console.error(err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isAuthenticated, user]);

  // Helper function to fetch episode count from AniList
  const fetchAniListEpisodes = async (title) => {
    const query = `
      query ($search: String) {
        Media(search: $search, type: ANIME) {
          episodes
          nextAiringEpisode {
            episode
          }
        }
      }
    `;

    try {
      const res = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          variables: { search: title },
        }),
      });

      const json = await res.json();
      const media = json.data.Media;

      if (media.episodes) return media.episodes;
      if (media.nextAiringEpisode) return media.nextAiringEpisode.episode - 1;

      return 0;
    } catch (err) {
      console.error('AniList fetch error:', err);
      return 0;
    }
  };

  // Helper function to fetch chapter count from AniList
  const fetchAniListMangaChapters = async (title) => {
    const query = `
      query ($search: String) {
        Media(search: $search, type: MANGA) {
          chapters
        }
      }
    `;

    try {
      const res = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          variables: { search: title },
        }),
      });

      const json = await res.json();
      const media = json.data?.Media;

      if (media?.chapters) return media.chapters;

      return 0;
    } catch (err) {
      console.error('AniList fetch error:', err);
      return 0;
    }
  };

  // Fetch individual media item by ID
  const fetchMediaDetails = async (mediaId, mediaType) => {
    switch (mediaType) {
      case 'anime': {
        const res = await fetch(`https://api.jikan.moe/v4/anime/${mediaId}`);
        if (!res.ok) throw new Error('Anime not found');
        const json = await res.json();
        const a = json.data;

        let count = a.episodes;
        if (count === null) {
          count = await fetchAniListEpisodes(a.title);
        }

        return {
          id: a.mal_id,
          title: a.title,
          count: count ?? 0,
          type: 'anime',
        };
      }

      case 'manga':
      case 'manhwa': {
        const res = await fetch(`https://api.jikan.moe/v4/manga/${mediaId}`);
        if (!res.ok) throw new Error('Manga not found');
        const json = await res.json();
        const m = json.data;

        let count = m.chapters;
        if (count === null) {
          count = await fetchAniListMangaChapters(m.title);
        }

        return {
          id: m.mal_id,
          title: m.title,
          count: count ?? 0,
          type: m.type?.toLowerCase() || mediaType,
        };
      }

      case 'show': {
        const res = await fetch(`https://api.tvmaze.com/shows/${mediaId}`);
        if (!res.ok) throw new Error('Show not found');
        const s = await res.json();
        return {
          id: s.id,
          title: s.name,
          count: s.runtime || 0,
          type: 'show',
        };
      }

      case 'book': {
        return {
          id: mediaId,
          count: 1,
          type: 'book',
        };
      }

      default:
        throw new Error(`Unknown media type: ${mediaType}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-center px-6 py-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Your Profile</h2>
          <p className="text-lg text-gray-400 mb-8">Please log in to view your profile</p>
          <Link
            to="/login"
            className="inline-block px-8 py-3.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold shadow-lg shadow-green-900/40 transition-all hover:scale-105"
          >
            Log In
          </Link>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-zinc-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-400 text-xl">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100 pb-12">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-green-900/50">
            {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2">{user.name}</h1>
          <p className="text-zinc-400 text-lg">{user.email}</p>
        </motion.div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Watched */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-8 border border-zinc-700/50 shadow-xl hover:scale-105 transition-transform"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-900/50">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-cyan-400 text-lg font-semibold">Watched</h3>
            </div>
            <div className="text-5xl font-bold text-white mb-2">{stats.totalWatched}</div>
            <p className="text-zinc-500 text-sm">Total items completed</p>
          </motion.div>

          {/* Favorites */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-8 border border-zinc-700/50 shadow-xl hover:scale-105 transition-transform"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-900/50">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-pink-400 text-lg font-semibold">Favorites</h3>
            </div>
            <div className="text-5xl font-bold text-white mb-2">{stats.totalFavorites}</div>
            <p className="text-zinc-500 text-sm">Saved for later</p>
          </motion.div>

          {/* Total Units */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-8 shadow-xl hover:scale-105 transition-transform border border-green-500/30"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-white text-lg font-semibold">Content Units</h3>
            </div>
            <div className="text-5xl font-bold text-white mb-2">{stats.totalUnits.toLocaleString()}</div>
            <p className="text-green-100 text-sm">Episodes, chapters & runtime</p>
          </motion.div>
        </div>

        {/* Category Breakdown */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-8 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></span>
            Category Breakdown
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <CategoryCard title="Anime" count={stats.animeCount} icon="🎬" gradient="from-cyan-500 to-blue-600" />
            <CategoryCard title="Manga" count={stats.mangaCount} icon="📖" gradient="from-purple-500 to-pink-600" />
            <CategoryCard title="TV Shows" count={stats.showCount} icon="📺" gradient="from-emerald-500 to-green-600" />
            <CategoryCard title="Books" count={stats.bookCount} icon="📚" gradient="from-amber-500 to-orange-600" />
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <Link 
            to="/watched" 
            className="group px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-green-900/40 transition-all hover:scale-105 text-center flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Watched
          </Link>
          <Link 
            to="/favorites" 
            className="group px-8 py-4 bg-zinc-800 hover:bg-zinc-700 border-2 border-zinc-700 hover:border-zinc-600 text-white font-semibold rounded-xl transition-all hover:scale-105 text-center flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            View Favorites
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function CategoryCard({ title, count, icon, gradient }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white shadow-xl border border-white/10`}
    >
      <div className="text-3xl mb-3">{icon}</div>
      <div className="text-4xl font-bold mb-1">{count}</div>
      <div className="text-sm font-medium opacity-90">{title}</div>
    </motion.div>
  );
}