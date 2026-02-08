import { useState } from 'react';

export default function Header({ onGlobalSearch }) {
  const [query, setQuery] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    onGlobalSearch(query);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-800">
      <div className="max-w-screen-2xl mx-auto px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl">A</div>
          <span className="text-2xl font-bold tracking-tighter text-white">AnimeHub</span>
        </div>

        <form onSubmit={handleSubmit} className="w-96">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search across everything..."
            className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-6 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
          />
        </form>

        <div className="flex items-center gap-6 text-zinc-400">
          <button className="hover:text-white transition">Login</button>
          <div className="w-9 h-9 bg-zinc-800 rounded-full" />
        </div>
      </div>
    </header>
  );
}