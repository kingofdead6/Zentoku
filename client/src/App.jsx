// src/App.jsx
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import AnimePage from './pages/AnimeSection';
import MangaPage from './pages/MangaSection';
import ShowsPage from './pages/ShowsSection';
import BooksPage from './pages/BooksSection';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import FavoritesPage from './pages/FavoritesPage';
import WatchedPage from './pages/WatchedPage';
import ProfilePage from './pages/ProfilePage';

function Layout() {
  return (
    <div className="bg-zinc-950 text-white min-h-screen">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-72 pt-24 pb-16 px-6 md:px-12 max-w-screen-2xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route element={<Layout />}>
            <Route index element={<AnimePage />} />
            <Route path="/anime" element={<AnimePage />} />
            <Route path="/manga" element={<MangaPage />} />
            <Route path="/shows" element={<ShowsPage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/watched" element={<WatchedPage />} />
            <Route path="*" element={<div className="text-center py-40 text-2xl">404</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;