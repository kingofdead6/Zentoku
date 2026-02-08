import { useState, useEffect } from 'react';

export default function FilterPanel({ media, onFilterChange }) {
  const [search, setSearch] = useState('');
  const [yearMin, setYearMin] = useState('');
  const [yearMax, setYearMax] = useState('');
  const [countMin, setCountMin] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);

  const allGenres = [...new Set(media.flatMap(m => m.genres || []))];

  useEffect(() => {
    const filtered = media.filter(item => {
      const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());
      const matchYear = (!yearMin || (item.year && item.year >= +yearMin)) &&
                        (!yearMax || (item.year && item.year <= +yearMax));
      const matchCount = (!countMin || (item.count && item.count >= +countMin));
      const matchGenre = selectedGenres.length === 0 ||
        selectedGenres.every(g => (item.genres || []).includes(g));

      return matchSearch && matchYear && matchCount && matchGenre;
    });
    onFilterChange(filtered);
  }, [search, yearMin, yearMax, countMin, selectedGenres, media]);

  return (
    <div className="bg-zinc-900 p-6 rounded-3xl space-y-6">
      <input
        type="text"
        placeholder="Search this section..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full bg-zinc-800 text-white px-5 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-500"
      />

      <div>
        <p className="text-zinc-400 text-sm mb-2">Year</p>
        <div className="flex gap-4">
          <input type="number" placeholder="Min" value={yearMin} onChange={e => setYearMin(e.target.value)}
            className="bg-zinc-800 w-full px-4 py-2 rounded-xl" />
          <input type="number" placeholder="Max" value={yearMax} onChange={e => setYearMax(e.target.value)}
            className="bg-zinc-800 w-full px-4 py-2 rounded-xl" />
        </div>
      </div>

      <div>
        <p className="text-zinc-400 text-sm mb-2">
          {media[0]?.type === 'anime' ? 'Episodes' : media[0]?.type === 'manga' ? 'Chapters' : 'Runtime'}
        </p>
        <input type="number" placeholder="Minimum" value={countMin} onChange={e => setCountMin(e.target.value)}
          className="bg-zinc-800 w-full px-4 py-2 rounded-xl" />
      </div>

      <div>
        <p className="text-zinc-400 text-sm mb-3">Genres</p>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
          {allGenres.map(g => (
            <button
              key={g}
              onClick={() => setSelectedGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])}
              className={`px-4 py-1 text-xs rounded-full transition-all ${selectedGenres.includes(g) ? 'bg-violet-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700'}`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}