import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Card from '../components/helpers/Card';
import Loading from '../components/helpers/Loading';
import CardPopup from '../components/helpers/CardPopup';

import axios from 'axios';
import { NODE_API } from '../../api';

// ────────────────────────────────────────────────
// Rate limiter (shared - safe to import from one file in real project)
let lastJikanRequest = 0;
const JIKAN_DELAY_MS = 350;

async function rateLimitedFetch(url) {
  const now = Date.now();
  const elapsed = now - lastJikanRequest;
  if (elapsed < JIKAN_DELAY_MS) {
    await new Promise(r => setTimeout(r, JIKAN_DELAY_MS - elapsed));
  }
  lastJikanRequest = Date.now();

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ────────────────────────────────────────────────
// Shared cache (localStorage + memory)
const CACHE_KEY = 'media_details_cache_v1';
let mediaCache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');

function getCachedMedia(id, type) {
  const key = `${type}_${id}`;
  const entry = mediaCache[key];
  if (entry && Date.now() - entry.timestamp < 24 * 60 * 60 * 60 * 1000) { // 24 hours
    return entry.data;
  }
  return null;
}

function setCachedMedia(id, type, data) {
  const key = `${type}_${id}`;
  mediaCache[key] = { data, timestamp: Date.now() };
  // Simple size limit
  const keys = Object.keys(mediaCache);
  if (keys.length > 200) delete mediaCache[keys[0]];
  localStorage.setItem(CACHE_KEY, JSON.stringify(mediaCache));
}

// ────────────────────────────────────────────────
export default function WatchingPage() {
  const { user, isAuthenticated } = useAuth();
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.userId) return;

    const fetchWatching = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await axios.get(`${NODE_API}/list/watching`, {
          headers: { 'x-user-id': user.userId },
          timeout: 12000,
        });

        const watchinglist = data.watchinglist ?? [];

        if (watchinglist.length === 0) {
          setMediaItems([]);
          return;
        }

        const results = await Promise.allSettled(
          watchinglist.map(async (item) => {
            try {
              return await fetchMediaDetails(item.mediaId, item.mediaType);
            } catch (err) {
              console.warn(`Failed to fetch ${item.mediaType}/${item.mediaId}:`, err.message);
              return null;
            }
          })
        );

        const successful = results
          .filter(r => r.status === 'fulfilled' && r.value !== null)
          .map(r => r.value);

        setMediaItems(successful);

        if (successful.length < watchinglist.length) {
          console.warn(`Only loaded ${successful.length}/${watchinglist.length} watching items`);
        }
      } catch (err) {
        console.error("Failed to load watching items:", err);
        setError(
          err.response?.data?.message ||
          "Could not load your watching items. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWatching();
  }, [isAuthenticated, user?.userId]);

  // ────────────────────────────────────────────────
  const fetchMediaDetails = async (mediaId, mediaType) => {
    const cached = getCachedMedia(mediaId, mediaType);
    if (cached) return cached;

    let result = null;

    try {
      switch (mediaType.toLowerCase()) {
        case 'anime': {
          const json = await rateLimitedFetch(`https://api.jikan.moe/v4/anime/${mediaId}`);
          const a = json.data;

          let episodes = a.episodes;
          if (episodes == null) {
            episodes = await fetchAniListEpisodes(a.title?.english || a.title);
          }

          result = {
            id: a.mal_id,
            title: a.title,
            image: a.images?.jpg?.large_image_url || '',
            year: a.year,
            count: episodes ?? 0,
            genres: a.genres?.map(g => g.name) || [],
            type: 'anime',
            score: a.score ?? 0,
            description: a.synopsis || '',
          };
          break;
        }

        case 'manga':
        case 'manhwa': {
          const json = await rateLimitedFetch(`https://api.jikan.moe/v4/manga/${mediaId}`);
          const m = json.data;

          let chapters = m.chapters;
          if (chapters == null) {
            chapters = await fetchAniListMangaChapters(m.title?.english || m.title);
          }

          result = {
            id: m.mal_id,
            title: m.title,
            image: m.images?.jpg?.large_image_url || '',
            year: m.published?.from ? new Date(m.published.from).getFullYear() : null,
            count: chapters ?? 'Ongoing',
            genres: m.genres?.map(g => g.name) || [],
            type: m.type?.toLowerCase() || mediaType,
            score: m.score ?? 0,
            description: m.synopsis || '',
          };
          break;
        }

        case 'show':
        case 'tv': {
          const s = await fetch(`https://api.tvmaze.com/shows/${mediaId}`).then(r => {
            if (!r.ok) throw new Error('Show not found');
            return r.json();
          });

          result = {
            id: s.id,
            title: s.name,
            image: s.image?.original || s.image?.medium || 'https://via.placeholder.com/300x450?text=No+Image',
            year: s.premiered ? new Date(s.premiered).getFullYear() : null,
            count: s.runtime || null,
            genres: s.genres || [],
            score: s.rating?.average ?? 0,
            type: 'show',
            description: s.summary ? s.summary.replace(/<[^>]+>/g, '') : '',
          };
          break;
        }

        case 'book': {
          const b = await fetch(`https://openlibrary.org${mediaId}.json`).then(r => {
            if (!r.ok) throw new Error('Book not found');
            return r.json();
          });

          const coverId = b.covers?.[0];
          const image = coverId
            ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
            : 'https://via.placeholder.com/300x450?text=No+Cover';

          result = {
            id: mediaId,
            title: b.title,
            image,
            year: b.first_publish_date ? new Date(b.first_publish_date).getFullYear() : null,
            genres: b.subjects?.slice(0, 6) || [],
            type: 'book',
            author: b.authors?.[0]?.name || 'Unknown Author',
            description: b.description?.value || b.description || 'No description available',
          };
          break;
        }

        default:
          throw new Error(`Unsupported media type: ${mediaType}`);
      }

      if (result) {
        setCachedMedia(mediaId, mediaType, result);
      }

      return result;
    } catch (err) {
      // 404 / not found → skip silently
      if (err.message.includes('404') || err.message.includes('not found')) {
        return null;
      }
      console.warn(`Media fetch error (${mediaType}/${mediaId}):`, err.message);
      return null;
    }
  };

  // ─── AniList helpers ────────────────────────────────────────
  const fetchAniListEpisodes = async (title) => {
    if (!title) return 0;
    try {
      const res = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query ($search: String) {
              Media(search: $search, type: ANIME) {
                episodes
                nextAiringEpisode { episode }
              }
            }
          `,
          variables: { search: title },
        }),
      });
      const { data } = await res.json();
      const media = data?.Media;
      // eslint-disable-next-line no-constant-binary-expression
      return media?.episodes ?? (media?.nextAiringEpisode?.episode - 1) ?? 0;
    } catch {
      return 0;
    }
  };

  const fetchAniListMangaChapters = async (title) => {
    if (!title) return 'Ongoing';
    try {
      const res = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query ($search: String) {
              Media(search: $search, type: MANGA) {
                chapters
              }
            }
          `,
          variables: { search: title },
        }),
      });
      const { data } = await res.json();
      return data?.Media?.chapters ?? 'Ongoing';
    } catch {
      return 'Ongoing';
    }
  };

  // ─── UI handlers ────────────────────────────────────────────
  const handleItemRemoved = (mediaId, mediaType) => {
    setMediaItems(prev =>
      prev.filter(item => !(String(item.id) === String(mediaId) && item.type === mediaType))
    );
    setSelectedItem(null);
  };

  // ─── Render ─────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <section className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-center px-6 py-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Your Watching Items</h2>
          <p className="text-xl text-gray-300 mb-8">Please log in to view your watching items</p>
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

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-center text-red-400 text-xl py-12">{error}</div>
      </div>
    );
  }

  if (mediaItems.length === 0) {
    return (
      <section className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-center py-24 text-gray-400 text-lg">
          You haven't added any watching items yet.<br />
          <Link to="/" className="text-green-400 hover:underline ml-2">
            Start exploring!
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-center text-white">
            My Watching List
          </h1>
          <p className="text-center text-green-400/70 mt-3">
            Your saved anime · manga · shows · books
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 mt-8">
          {mediaItems.map(item => (
            <Card
              key={`${item.type}-${item.id}`}
              item={item}
              onClick={() => setSelectedItem(item)}
            />
          ))}
        </div>

        <p className="text-center text-gray-600 text-sm mt-16">
          Click any card to view details
        </p>
      </div>

      <CardPopup
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onItemRemoved={handleItemRemoved}
      />
    </section>
  );
}