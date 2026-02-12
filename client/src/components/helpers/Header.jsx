import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo  from '../../assets/Logo.jpg';

export default function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-100 h-20
      bg-green-300/10 backdrop-blur-xl border-b border-white/10">
      <div className="h-full max-w-screen-2xl mx-auto px-6 flex items-center justify-between">

        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-zinc-400 hover:text-white text-2xl"
          >
            ☰
          </button>

          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className=" rounded-full flex items-center justify-center font-black text-white">
               <img src={Logo} alt="Logo" className="w-12 h-12 rounded-full" />
            </div>
            <span className="text-white font-bold text-xl hidden sm:block">
              Zentoku
            </span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-zinc-200 cursor-pointer "
            >
              Login
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/profile')}
                className="cursor-pointer w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white font-bold hover:scale-110 transform transition"
              >
                {user.email?.[0]?.toUpperCase()}
              </button>
              <button
                onClick={logout}
                className="text-zinc-400 hover:text-red-500 transform transition cursor-pointer text-sm"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
