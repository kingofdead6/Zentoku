import { NavLink, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  // Auto close on route change (mobile)
  useEffect(() => {
    onClose?.();
  }, [location.pathname]);

  const navItems = [
    { to: '/anime', label: 'Anime', icon: '🎥' },
    { to: '/manga', label: 'Manga', icon: '📖' },
    { to: '/shows', label: 'Shows', icon: '📺' },
    { to: '/books', label: 'Books', icon: '📚' },
    //{ to: '/games', label: 'Games', icon: '🎮' },
  ];

  const listItems = [
    { to: '/favorites', label: 'Favorites', icon: '❤️' },
    { to: '/watched', label: 'Watched', icon: '✅' },
    { to: '/wishlist', label: 'Wishlist', icon: '📋' },
    { to: '/watching', label: 'Watching', icon: '👀' },
  ];

  const linkClass = ({ isActive }) =>
    `flex items-center gap-4 px-4 py-3 rounded-xl transition text-lg font-medium
    ${
      isActive
        ? 'bg-green-600 text-white'
        : 'text-zinc-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <>
      {/* Backdrop (mobile) */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40  backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64
          bg-green-600/20 backdrop-blur-xl border-r border-white/10
          transform transition-transform duration-300 ease-in-out
          overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* space for fixed header */}
        <div className="h-20" />

        <div className="px-4 pb-10">
          <Section title="Browse">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={linkClass}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </Section>

          <Section title="Library">
            {listItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={linkClass}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </Section>
        </div>
      </aside>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <div className="px-1  mt-4 b-3 text-[20px] tracking-widest text-[#ffdbdb] uppercase">
        {title}
      </div>
      <span className="block w-20 h-1 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full mb-4" />
      <div className="space-y-1">{children}</div>
    </div>
  );
}
