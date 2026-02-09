import { useState, useEffect } from 'react';
import { fetchAnime } from '../utils/api';
import Card from '../components/Card';
import Loading from '../components/Loading';

export default function AnimePage() {
  const [media, setMedia] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch anime (page OR search change)
  useEffect(() => {
    async function loadAnime() {
      try {
        setLoading(true);
        const { items, hasNextPage } = await fetchAnime(page, search);

        setMedia(items);
        setFiltered(items);
        setHasMore(hasNextPage);
      } catch (err) {
        console.error(err);
        setError('Failed to load anime.');
      } finally {
        setLoading(false);
      }
    }

    loadAnime();
  }, [page, search]);

  const handleSearch = () => {
    setPage(1);          // reset pagination
    setSearch(input);   // trigger new API query
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
            Browse Anime
          </h2>
          <div className="text-zinc-500 text-sm md:text-base">
            Powered by AniList
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search anime..."
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
     

        <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-20 text-zinc-400 text-xl">
              No results found
            </div>
          ) : (
            filtered.map(item => (
              <Card key={item.id} item={item} />
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-6 mt-16">
        <button
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
          className="px-5 py-2 rounded-lg bg-zinc-800 text-white disabled:opacity-40"
        >
          ← Previous
        </button>

        <span className="text-white text-lg">
          Page {page}
        </span>

        <button
          disabled={!hasMore}
          onClick={() => setPage(p => p + 1)}
          className="px-5 py-2 rounded-lg bg-zinc-800 text-white disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </section>
  );
}
