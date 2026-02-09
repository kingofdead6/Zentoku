// src/pages/WatchedPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { NODE_API } from '../../api'; // adjust path if needed
import { Link } from 'react-router-dom';
import CardPopup from '../components/CardPopup'; // adjust path

// You can later extract this to a shared file (e.g. utils/fetchMediaItem.js)
// and import it in both FavoritesPage and WatchedPage
const fetchMediaItem = async (mediaType, mediaId) => {
  try {
    if (mediaType === 'anime') {
      const res = await axios.get(`https://api.jikan.moe/v4/anime/${mediaId}`);
      const a = res.data.data;

      return {
        id: a.mal_id,
        title: a.title,
        image: a.images?.jpg?.large_image_url,
        year: a.year,
        count: a.episodes,
        genres: a.genres?.map(g => g.name) || [],
        type: 'anime',
        score: a.score ?? null,
        description: a.synopsis || '',
      };
    }

    if (mediaType === 'manga' || mediaType === 'manhwa') {
      const res = await axios.get(`https://api.jikan.moe/v4/manga/${mediaId}`);
      const m = res.data.data;

      return {
        id: m.mal_id,
        title: m.title,
        image: m.images?.jpg?.large_image_url,
        year: m.year,
        count: m.chapters,
        genres: m.genres?.map(g => g.name) || [],
        type: m.type?.toLowerCase() || mediaType,
        score: m.score ?? null,
        description: m.synopsis || '',
      };
    }

    if (mediaType === 'show') {
      const res = await axios.get(`https://api.tvmaze.com/shows/${mediaId}`);
      const s = res.data;

      return {
        id: s.id,
        title: s.name,
        image: s.image?.original || s.image?.medium || null,
        year: s.premiered ? new Date(s.premiered).getFullYear() : null,
        count: s.runtime || null,
        genres: s.genres || [],
        type: 'show',
        score: s.rating?.average || null,     // added for consistency
        description: s.summary ? s.summary.replace(/<[^>]+>/g, '') : '',
      };
    }

    if (mediaType === 'book') {
      // OpenLibrary single-item fetch is limited — placeholder for now
      return {
        id: mediaId,
        title: `Book ID: ${mediaId.replace('/works/', '')}`,
        image: null,
        year: null,
        count: null,
        genres: [],
        type: 'book',
        score: null,
        description: 'Detailed book info not available (single lookup not implemented)',
      };
    }

    return null;
  } catch (err) {
    console.error(`Failed to fetch ${mediaType} ${mediaId}:`, err);
    return null;
  }
};

export default function WatchedPage() {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedItem, setSelectedItem] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchWatched = async () => {
      try {
        const res = await axios.get(`${NODE_API}/list/watched`, {
          headers: { 'x-user-id': user.userId },
        });

        const watchedItems = res.data.watched || [];
        setItems(watchedItems);

        setLoading(true);

        const fetchedMedia = await Promise.all(
          watchedItems.map(item =>
            fetchMediaItem(item.mediaType, item.mediaId)
          )
        );

        const validItems = fetchedMedia.filter(Boolean);
        setMediaItems(validItems);
      } catch (err) {
        setError('Failed to load your watched list');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWatched();
  }, [isAuthenticated, user]);

  const openPopup = (media) => {
    setSelectedItem(media);
    setIsPopupOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-20 text-2xl">
        Please <Link to="/login" className="text-blue-400 underline">login</Link> to see your watched list.
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-20 text-xl">Loading your watched list...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-400 text-xl">{error}</div>;
  }

  return (
    <div className="pb-12">
      <h1 className="text-4xl md:text-5xl font-bold mb-10 text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        My Watched
      </h1>

      {mediaItems.length === 0 ? (
        <p className="text-center text-xl text-gray-400">
          You haven't marked anything as watched yet
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 md:gap-6">
          {mediaItems.map((item) => (
            <div
              key={item.id}
              onClick={() => openPopup(item)}
              className="cursor-pointer group bg-zinc-900 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] border border-zinc-800"
            >
              <div className="relative aspect-[3/4.2]">
                <img
                  src={item.image || 'https://via.placeholder.com/300x450?text=No+Image'}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x450?text=No+Image';
                  }}
                />
                {item.score && (
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">
                    ★ {item.score}
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-white line-clamp-2 mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-400">
                  {item.year || 'N/A'} • {item.type.toUpperCase()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <CardPopup
        item={selectedItem}
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </div>
  );
}