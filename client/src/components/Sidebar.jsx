import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  const navItems = [
    { to: '/anime', label: 'Anime', emoji: '🎥' },
    { to: '/manga', label: 'Manga', emoji: '📖' },
    { to: '/shows', label: 'Shows', emoji: '📺' },
    { to: '/books', label: 'Books', emoji: '📚' },
  ];

  return (
    <aside className="w-72 fixed left-0 top-0 h-screen bg-zinc-950 border-r border-zinc-800 pt-24 px-6 overflow-y-auto">
      <div className="uppercase text-xs font-mono tracking-widest text-zinc-500 mb-6">Categories</div>
      
      <nav className="space-y-2">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-4 px-6 py-4 rounded-2xl transition-all text-lg font-medium ${
                isActive
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
              }`
            }
          >
            <span>{item.emoji}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}