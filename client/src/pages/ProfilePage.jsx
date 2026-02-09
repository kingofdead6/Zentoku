// src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { NODE_API } from '../../api'; // adjust path
import { Link } from 'react-router-dom';
import { fetchMediaItem } from '../utils/api'; // assume you extracted this shared function

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();

  const [watched, setWatched] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [stats, setStats] = useState({
    totalWatched: 0,
    totalFavorites: 0,
    animeCount: 0,
    mangaCount: 0,
    showCount: 0,
    bookCount: 0,
    totalEpisodes: 0, // anime episodes + manga chapters + show runtime/episodes + books (1 each)
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Get watched list
        const watchedRes = await axios.get(`${NODE_API}/list/watched`, {
          headers: { 'x-user-id': user.userId },
        });
        const watchedItems = watchedRes.data.watched || [];

        // Get favorites (wishlist)
        const favRes = await axios.get(`${NODE_API}/list/wishlist`, {
          headers: { 'x-user-id': user.userId },
        });
        const favItems = favRes.data.wishlist || [];

        // Fetch full details for watched items to calculate progress
        const watchedDetails = await Promise.all(
          watchedItems.map(item =>
            fetchMediaItem(item.mediaType, item.mediaId)
          )
        ).then(results => results.filter(Boolean));

        // Simple stats calculation
        let animeCount = 0;
        let mangaCount = 0;
        let showCount = 0;
        let bookCount = 0;
        let totalUnits = 0; // episodes / chapters / books

        watchedDetails.forEach(item => {
          if (item.type === 'anime') {
            animeCount++;
            totalUnits += item.count || 0; // episodes
          } else if (item.type === 'manga' || item.type === 'manhwa') {
            mangaCount++;
            totalUnits += item.count || 0; // chapters
          } else if (item.type === 'show') {
            showCount++;
            totalUnits += item.count || 0; // runtime minutes (or could be episode count if available)
          } else if (item.type === 'book') {
            bookCount++;
            totalUnits += 1; // each book = 1 "unit"
          }
        });

        setWatched(watchedItems);
        setFavorites(favItems);

        setStats({
          totalWatched: watchedItems.length,
          totalFavorites: favItems.length,
          animeCount,
          mangaCount,
          showCount,
          bookCount,
          totalEpisodes: totalUnits,
        });
      } catch (err) {
        console.error(err);
        setError('Failed to load profile statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20 text-2xl">
        Please <Link to="/login" className="text-blue-400 underline">login</Link> to view your profile.
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-20 text-xl">Loading your profile...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-400 text-xl">{error}</div>;
  }

  const progress = stats.totalWatched > 0
    ? Math.round((stats.totalWatched / (stats.totalWatched + stats.totalFavorites)) * 100)
    : 0;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      {/* Header / User Info */}
      <div className="bg-zinc-900 rounded-2xl p-8 mb-10 shadow-xl border border-zinc-800">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar / Initials */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-5xl font-bold text-white shadow-lg">
            {user.name?.[0]?.toUpperCase() || '?'}
          </div>

          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">{user.name}</h1>
            <p className="text-zinc-400 text-lg mb-6">{user.email}</p>

            {/* Stats Circle */}
            <div className="flex flex-wrap gap-10">
              <div className="text-center">
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-zinc-700"
                      strokeWidth="10"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="text-cyan-400"
                      strokeWidth="10"
                      strokeDasharray={251}
                      strokeDashoffset={251 - (progress / 100) * 251}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-3xl font-bold text-white">{progress}%</span>
                    <span className="text-xs text-zinc-400">Watched</span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-zinc-500">
                  Watched vs Favorites
                </p>
              </div>

              <div className="flex flex-col justify-center gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-white">{stats.totalWatched}</span>
                  <span className="text-zinc-400">Total Watched</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-white">{stats.totalFavorites}</span>
                  <span className="text-zinc-400">Favorites</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-cyan-400">
                    {stats.totalEpisodes.toLocaleString()}
                  </span>
                  <span className="text-zinc-400">Units Watched</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard
          title="Anime"
          count={stats.animeCount}
          bg="from-blue-600 to-cyan-500"
        />
        <StatCard
          title="Manga / Manhwa"
          count={stats.mangaCount}
          bg="from-purple-600 to-pink-500"
        />
        <StatCard
          title="TV Shows"
          count={stats.showCount}
          bg="from-green-600 to-emerald-500"
        />
        <StatCard
          title="Books"
          count={stats.bookCount}
          bg="from-amber-600 to-yellow-500"
        />
      </div>

      {/* Quick Links */}
      <div className="flex justify-center gap-6 flex-wrap">
        <Link
          to="/watched"
          className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white font-semibold transition"
        >
          View Watched List
        </Link>
        <Link
          to="/favorites"
          className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white font-semibold transition"
        >
          View Favorites
        </Link>
      </div>
    </div>
  );
}

function StatCard({ title, count, bg }) {
  return (
    <div className={`bg-gradient-to-br ${bg} rounded-2xl p-6 text-white shadow-lg`}>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-4xl font-bold">{count}</p>
    </div>
  );
}