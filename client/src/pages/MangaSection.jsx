import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { fetchManga } from '../utils/api';
import Card from '../components/Card';
import FilterPanel from '../components/FilterPanel';

export default function MangaSection() {
  const [media, setMedia] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  const containerRef = useRef(null);

  // Fetch manga when page OR search changes
  useEffect(() => {
    async function loadManga() {
      setLoading(true);

      const { items, hasNextPage } = await fetchManga(page, search);

      // 🔁 Replace old data
      setMedia(items);
      setFiltered(items);
      setHasMore(hasNextPage);

      setLoading(false);
    }

    loadManga();
  }, [page, search]);

  // GSAP animation on result change
  useEffect(() => {
    if (!filtered.length) return;

    gsap.fromTo(
      containerRef.current.querySelectorAll('.card'),
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.05,
        duration: 0.8,
        ease: 'power3.out',
      }
    );
  }, [filtered]);

  const handleSearch = () => {
    setPage(1);
    setSearch(input);
  };

  return (
    <section id="manga" className="scroll-mt-20 py-8">
      {/* Header + Search */}
      <div className="flex flex-col gap-6 mb-10">
        <div className="flex justify-between items-end">
          <h2 className="text-4xl font-bold text-white">Browse Manga</h2>
          <div className="text-zinc-500">Powered by MyAnimeList (Jikan)</div>
        </div>

        <div className="flex gap-3">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search manga..."
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
      <div className="grid grid-cols-12 gap-8">


        {/* Cards */}
        <div
          ref={containerRef}
          className="col-span-12 lg:col-span-9 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
        >
          {!loading && filtered.length === 0 && (
            <div className="col-span-full text-center py-20 text-zinc-400 text-xl">
              No results found
            </div>
          )}

          {filtered.map(item => (
            <Card key={item.id} item={item} />
          ))}
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
