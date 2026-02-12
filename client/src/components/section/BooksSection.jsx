import { useState, useEffect } from 'react';
import { fetchBooks } from '../../utils/api';
import Card from '../helpers/Card';
import Loading from '../helpers/Loading';

export default function BooksPage() {
  const [media, setMedia] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadBooks() {
      try {
        setLoading(true);
        const { items, hasNextPage } = await fetchBooks(page, search);

        setMedia(items);
        setFiltered(items);
        setHasMore(hasNextPage);
      } catch (err) {
        console.error(err);
        setError('Failed to load books.');
      } finally {
        setLoading(false);
      }
    }

    loadBooks();
  }, [page, search]);

  const handleSearch = () => {
    setPage(1);
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
              Browse Books & Web Novels
            </h2>
  
          </div>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search books, novels, authors..."
              className="flex-1 px-5 py-3.5 rounded-xl bg-gray-800/80 border border-gray-700 
                         text-white placeholder-gray-400 
                         focus:outline-none focus:border-green-500/60 focus:ring-2 focus:ring-green-500/20 
                         transition-all duration-200"
            />
            <button
              onClick={handleSearch}
              className="px-8 py-3.5 rounded-xl bg-green-600 hover:bg-green-500 
                         text-white font-semibold shadow-md transition-colors duration-200
                         active:bg-green-700 sm:w-auto w-full"
            >
              Search
            </button>
          </div>
        </div>

        {/* Books Grid */}
        <div className="mt-6">
          {filtered.length === 0 ? (
            <div className="text-center py-24 text-gray-400 text-lg sm:text-xl">
              {search
                ? 'No books or novels found. Try adjusting your search.'
                : 'No results found on this page.'}
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

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 mt-12 sm:mt-16">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-6 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 
                         disabled:opacity-40 disabled:cursor-not-allowed
                         text-white font-medium transition-colors"
            >
              ← Previous
            </button>

            <span className="text-lg sm:text-xl font-medium px-2">
              Page {page}
            </span>

            <button
              disabled={!hasMore}
              onClick={() => setPage((p) => p + 1)}
              className="px-6 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 
                         disabled:opacity-40 disabled:cursor-not-allowed
                         text-white font-medium transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}