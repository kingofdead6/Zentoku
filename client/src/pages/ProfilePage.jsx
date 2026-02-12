import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { NODE_API } from '../../api';
import { Link } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

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
            units += item.count || 0; // episodes
          } else if (item.type === 'manga' || item.type === 'manhwa') {
            manga++;
            if (typeof item.count === 'number') {
              units += item.count; // chapters
            }
          } else if (item.type === 'show') {
            show++;
            units += item.count || 0; // runtime in minutes
          } else if (item.type === 'book') {
            book++;
            units += 1; // count books as 1 unit each
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

      return 0; // Return 0 instead of 'Ongoing' for calculations
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

        // Get episode count with AniList fallback
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

        // Get chapter count with AniList fallback
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
          count: 1, // Books count as 1 unit
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Your Profile</h2>
          <p className="text-xl text-gray-300 mb-8">Please log in to view your profile</p>
          <Link
            to="/login"
            className="inline-block px-8 py-3.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold shadow-md transition-colors"
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
        <div className="text-center py-20 text-xl">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-center py-20 text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  const progress = stats.totalWatched + stats.totalFavorites > 0
    ? Math.round((stats.totalWatched / (stats.totalWatched + stats.totalFavorites)) * 100)
    : 0;

  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100">
      <div className="max-w-4xl mx-auto py-12 px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white tracking-tighter mb-2">{user.name}</h1>
          <p className="text-zinc-400 text-xl">{user.email}</p>
        </div>

        {/* Main Stats Section */}
        <div className="bg-zinc-900/90 backdrop-blur-xl rounded-3xl p-10 border border-zinc-800 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-center gap-16">

            {/* Circle + Both Numbers */}
            <div className="relative w-64 h-64 flex-shrink-0">
              <CircularProgressbar
                value={progress}
                strokeWidth={8}
                styles={buildStyles({
                  pathColor: '#22d3ee',        // cyan
                  trailColor: '#3b82f6',       // blue (favorites color)
                  backgroundColor: '#18181b',
                  textColor: '#fff',
                  pathTransitionDuration: 1.2,
                })}
              />

              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="text-6xl font-bold text-white mb-1">{stats.totalWatched}</div>
                <div className="text-cyan-400 text-sm tracking-widest uppercase">Watched</div>

                <div className="my-6 w-16 h-px bg-gradient-to-r from-transparent via-zinc-500 to-transparent" />

                <div className="text-5xl font-bold text-purple-400 mb-1">{stats.totalFavorites}</div>
                <div className="text-purple-400 text-sm tracking-widest uppercase">Favorites</div>
              </div>
            </div>

            {/* Total Units */}
            <div className="text-center md:text-left">
              <div className="text-emerald-400 text-7xl font-bold mb-2 tracking-tighter">
                {stats.totalUnits.toLocaleString()}
              </div>
              <div className="text-zinc-400 text-2xl font-light">content units watched</div>
              <p className="text-zinc-500 text-sm mt-2">(episodes + chapters + runtime)</p>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <CategoryCard title="Anime" count={stats.animeCount} color="from-cyan-400 to-blue-500" />
          <CategoryCard title="Manga" count={stats.mangaCount} color="from-purple-400 to-pink-500" />
          <CategoryCard title="TV Shows" count={stats.showCount} color="from-emerald-400 to-green-500" />
          <CategoryCard title="Books" count={stats.bookCount} color="from-amber-400 to-yellow-500" />
        </div>

        {/* Links */}
        <div className="flex flex-col sm:flex-row justify-center gap-6 mt-16">
          <Link to="/watched" className="px-10 py-4 bg-white text-black font-semibold rounded-2xl hover:bg-zinc-200 transition text-center">
            View Watched
          </Link>
          <Link to="/favorites" className="px-10 py-4 bg-white/10 hover:bg-white/20 border border-white/20 font-semibold rounded-2xl transition text-center">
            View Favorites
          </Link>
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ title, count, color }) {
  return (
    <div className={`bg-gradient-to-br ${color} rounded-3xl p-8 text-white shadow-xl hover:scale-105 transition-transform`}>
      <div className="text-6xl font-bold mb-2">{count}</div>
      <div className="text-xl font-medium opacity-90">{title}</div>
    </div>
  );
}