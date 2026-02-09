import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const navItems = [
    { to: '/anime', label: 'Anime', emoji: '🎥' },
    { to: '/manga', label: 'Manga', emoji: '📖' },
    { to: '/shows', label: 'Shows', emoji: '📺' },
    { to: '/books', label: 'Books', emoji: '📚' },
  ];

  const listItems = [
    { to: '/favorites', label: 'Favorites', emoji: '❤️' },
    { to: '/watched', label: 'Watched', emoji: '✅' },
  ];

  return (
    <aside className="w-72 fixed left-0 top-0 h-screen bg-zinc-950 border-r border-zinc-800 pt-24 px-6 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900">
      {/* Categories */}
      <div className="uppercase text-xs font-mono tracking-widest text-zinc-500 mb-6">
        Categories
      </div>
      
      <nav className="space-y-2 mb-10">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-4 px-6 py-4 rounded-2xl transition-all text-lg font-medium ${
                isActive
                  ? 'bg-zinc-800 text-white shadow-inner'
                  : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
              }`
            }
          >
            <span className="text-xl">{item.emoji}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* My Lists */}
      <div className="uppercase text-xs font-mono tracking-widest text-zinc-500 mb-6">
        My Lists
      </div>

      <nav className="space-y-2">
        {listItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-4 px-6 py-4 rounded-2xl transition-all text-lg font-medium ${
                isActive
                  ? 'bg-zinc-800 text-white shadow-inner'
                  : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
              }`
            }
          >
            <span className="text-xl">{item.emoji}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}