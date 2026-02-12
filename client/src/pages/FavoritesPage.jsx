import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Card from '../components/helpers/Card';
import Loading from '../components/helpers/Loading';

import axios from 'axios';
import { NODE_API } from '../../api';

export default function FavoritesPage() {
  const { user, isAuthenticated } = useAuth();
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.userId) return;

    const fetchFavorites = async () => {
      try {
        setLoading(true);

        const res = await axios.get(`${NODE_API}/list/wishlist`, {
          headers: { 'x-user-id': user.userId },
        });

        const wishlist = res.data.wishlist || [];

        if (wishlist.length === 0) {
          setMediaItems([]);
          setLoading(false);
          return;
        }

        // Fetch full details for each item
        const fetched = await Promise.all(
          wishlist.map(async (item) => {
            try {
              return await fetchMediaDetails(item.mediaId, item.mediaType);
            } catch (err) {
              console.error(`Error fetching ${item.mediaType} ${item.mediaId}:`, err);
              return null;
            }
          })
        );

        // Filter out any null results (failed fetches)
        setMediaItems(fetched.filter(Boolean));
      } catch (err) {
        console.error(err);
        setError('Failed to load favorites. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
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

      return 'Ongoing';
    } catch (err) {
      console.error('AniList fetch error:', err);
      return 'Ongoing';
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
          image: a.images.jpg.large_image_url,
          year: a.year,
          count: count ?? 0,
          genres: a.genres.map(g => g.name),
          type: 'anime',
          score: a.score ?? 0,
          description: a.synopsis || '',
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
          image: m.images?.jpg?.large_image_url,
          year: m.year,
          count: count ?? 'Ongoing',
          genres: m.genres.map(g => g.name),
          type: m.type?.toLowerCase() || mediaType,
          score: m.score ?? 0,
          description: m.synopsis || '',
        };
      }

      case 'show': {
        const res = await fetch(`https://api.tvmaze.com/shows/${mediaId}`);
        if (!res.ok) throw new Error('Show not found');
        const s = await res.json();
        return {
          id: s.id,
          title: s.name,
          image: s.image?.medium || 'https://via.placeholder.com/300x400?text=No+Image',
          year: s.premiered ? new Date(s.premiered).getFullYear() : null,
          count: s.runtime || null,
          genres: s.genres || [],
          score: s.rating?.average ?? 0,
          type: 'show',
          description: s.summary ? s.summary.replace(/<[^>]+>/g, '') : '',
        };
      }

      case 'book': {
        // For books, the mediaId is the OpenLibrary key
        const res = await fetch(`https://openlibrary.org${mediaId}.json`);
        if (!res.ok) throw new Error('Book not found');
        const b = await res.json();
        
        // Get cover image if available
        const coverId = b.covers?.[0];
        const image = coverId 
          ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
          : 'https://via.placeholder.com/300x400?text=No+Cover';

        return {
          id: mediaId,
          title: b.title,
          image,
          year: b.first_publish_date ? new Date(b.first_publish_date).getFullYear() : null,
          genres: b.subjects?.slice(0, 5) || [],
          type: 'book',
          author: b.authors?.[0]?.name || 'Unknown',
          description: b.description?.value || b.description || b.subjects?.join(', ') || '',
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
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Your Favorites</h2>
          <p className="text-xl text-gray-300 mb-8">Please log in to view your favorite items</p>
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

  if (error) return <div className="text-center py-24 text-red-400 text-lg sm:text-xl">{error}</div>;

  if (mediaItems.length === 0) {
    return (
      <section className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100">
        <div className="text-center py-24 text-gray-400 text-lg sm:text-xl">
          You haven't added any favorites yet.
          <br className="sm:hidden" />
          <Link to="/" className="text-green-400 hover:underline ml-2">Start exploring!</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-center text-white">
            My Favorites
          </h1>
          <p className="text-center text-green-400/70 mt-2 text-sm md:text-base">
            Your saved anime, manga, shows & books
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 mt-6">
          {mediaItems.map((item) => (
            <div key={`${item.type}-${item.id}`} className="cursor-pointer">
              <Card item={item} />
            </div>
          ))}
        </div>

        <p className="text-center text-gray-500 text-sm mt-12">
          Click any card to see more details
        </p>
      </div>
    </section>
  );
}