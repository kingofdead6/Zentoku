import { useState, useEffect } from 'react';
import { fetchShows } from '../../utils/api';
import Card from '../helpers/Card';
import Loading from '../helpers/Loading';

export default function ShowsPage() {
  const [media, setMedia] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadShows() {
      try {
        setLoading(true);
        let items = [];

        if (search.trim()) {
          // Search endpoint
          const res = await fetch(
            `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(search.trim())}`
          );

          if (!res.ok) throw new Error('Search failed');

          const data = await res.json();

          items = data
            .map((d) => {
              const show = d.show;
              return {
                id: show.id,
                title: show.name,
                image:
                  show.image?.medium ||
                  'https://via.placeholder.com/300x400?text=No+Image',
                year: show.premiered
                  ? new Date(show.premiered).getFullYear()
                  : null,
                count: show.runtime || null,
                genres: show.genres || [],
                type: 'show',
                score: show.rating?.average || null,
                description: show.summary
                  ? show.summary.replace(/<[^>]+>/g, '')
                  : '',
              };
            })
            .filter((item) => item.score !== null) // keep only rated shows
            .sort((a, b) => (b.score || 0) - (a.score || 0)); // best rated first

          setHasMore(false); // no pagination in search mode
        } else {
          // Paginated fetch
          const data = await fetchShows(page);
          items = data;
          setHasMore(data.length > 0);
        }

        setMedia(items);
        setFiltered(items);
      } catch (err) {
        console.error(err);
        setError('Failed to load TV shows.');
      } finally {
        setLoading(false);
      }
    }

    loadShows();
  }, [page, search]);

  const handleSearch = () => {
    setPage(0);
    setSearch(input.trim());
  };

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="text-red-400 text-center py-20 text-lg sm:text-xl">
        {error}
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-gray-100 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header + Search */}
        <div className="py-8 md:py-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              TV Shows
            </h2>
      
          </div>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search TV shows..."
              className="flex-1 px-5 py-3.5 rounded-xl bg-gray-800/80 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-green-500/60 focus:ring-2 focus:ring-green-500/20 transition-all duration-200"
            />
            <button
              onClick={handleSearch}
              className="px-8 py-3.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold shadow-md transition-colors duration-200 active:bg-green-700 sm:w-auto w-full"
            >
              Search
            </button>
          </div>
        </div>

        {/* Shows Grid */}
        <div className="mt-6">
          {filtered.length === 0 ? (
            <div className="text-center py-24 text-gray-400 text-lg sm:text-xl">
              {search
                ? 'No shows found. Try adjusting your search.'
                : 'No rated shows available on this page.'}
            </div>
          ) : (
            <div
              className="
                grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-5 
                md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6
              "
            >
              {filtered.map((item) => (
                <Card key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Pagination - only shown when NOT searching */}
        {!search && (
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 mt-12 sm:mt-16">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="px-6 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition-colors"
            >
              ← Previous
            </button>

            <span className="text-lg sm:text-xl font-medium px-2">
              Page {page + 1}
            </span>

            <button
              disabled={!hasMore}
              onClick={() => setPage((p) => p + 1)}
              className="px-6 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}