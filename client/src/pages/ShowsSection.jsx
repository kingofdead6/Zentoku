import { useState, useEffect } from 'react';
import { fetchShows } from '../utils/api';
import Card from '../components/Card';
import FilterPanel from '../components/FilterPanel';
import Loading from '../components/Loading';

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

        if (search) {
          // Search endpoint
          const res = await fetch(
            `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(search)}`
          );
          const data = await res.json();

          items = data
            .map(d => {
              const show = d.show;
              return {
                id: show.id,
                title: show.name,
                image: show.image?.medium || 'https://via.placeholder.com/300x400?text=No+Image',
                year: show.premiered ? new Date(show.premiered).getFullYear() : null,
                count: show.runtime || null,
                genres: show.genres || [],
                type: 'show',
                score: show.rating?.average || null,
                description: show.summary
                  ? show.summary.replace(/<[^>]+>/g, '')
                  : '',
              };
            })
            .filter(item => item.score !== null)           // optional: remove unrated shows
            .sort((a, b) => (b.score || 0) - (a.score || 0)); // descending by rating

          setHasMore(false);
        } else {
          // Paginated shows
          const data = await fetchShows(page);

          items = data;
          setHasMore(data.length > 0);
        }

        setMedia(items);
        setFiltered(items);
      } catch (err) {
        console.error(err);
        setError('Failed to load shows.');
      } finally {
        setLoading(false);
      }
    }

    loadShows();
  }, [page, search]);

  const handleSearch = () => {
    setPage(0);
    setSearch(input);
  };

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="text-red-400 text-center py-20 text-xl">
        {error}
      </div>
    );
  }

  return (
    <section className="py-8">
      {/* Header */}
      <div className="flex flex-col gap-6 mb-10">
        <div className="flex justify-between items-end">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            TV Shows
          </h2>
          <div className="text-zinc-500 text-sm md:text-base">
            Powered by TVMaze • Ordered by Rating
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search shows..."
            className="flex-1 px-4 py-3 rounded-lg bg-zinc-900 text-white outline-none"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-3 rounded-lg bg-white text-black font-semibold"
          >
            Search
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-20 text-zinc-400 text-xl">
              {search ? 'No results found' : 'No rated shows available on this page'}
            </div>
          ) : (
            filtered.map(item => <Card key={item.id} item={item} />)
          )}
        </div>
      </div>

      {/* Pagination - note: sorting is per-page when paginating */}
      {!search && (
        <div className="flex justify-center items-center gap-6 mt-16">
          <button
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            className="px-5 py-2 rounded-lg bg-zinc-800 text-white disabled:opacity-40"
          >
            ← Previous
          </button>

          <span className="text-white text-lg">
            Page {page + 1} (sorted by rating)
          </span>

          <button
            disabled={!hasMore}
            onClick={() => setPage(p => p + 1)}
            className="px-5 py-2 rounded-lg bg-zinc-800 text-white disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </section>
  );
}