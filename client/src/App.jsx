import { AuthProvider } from './context/AuthContext';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/helpers/Header';
import Sidebar from './components/helpers/Sidebar';
import AnimePage from './components/section/AnimeSection';
import MangaPage from './components/section/MangaSection';
import ShowsPage from './components/section/ShowsSection';
import BooksPage from './components/section/BooksSection';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import FavoritesPage from './pages/FavoritesPage';
import WatchedPage from './pages/WatchedPage';
import ProfilePage from './pages/ProfilePage';
import { useState } from 'react';
import FloatingAnimeCharacter from "./components/helpers/FloatingAnimeCharacter";
import SplashScreen from './components/helpers/SplashScreen';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen  text-zinc-100">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      
      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
  <FloatingAnimeCharacter />
        <main className="flex-1 lg:ml-64">
          <div className="h-4" />
          <div className="px-6 md:px-10 py-10 max-w-screen-2xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}



function App() {
  return (
   
    <AuthProvider>
      <BrowserRouter>
       <SplashScreen />
        <Routes>
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<Layout />}>
            <Route index element={<AnimePage />} />
            <Route path="/anime" element={<AnimePage />} />
            <Route path="/manga" element={<MangaPage />} />
            <Route path="/shows" element={<ShowsPage />} />
            <Route path="/books" element={<BooksPage />} />
            <Route path="/profile" element={<ProfilePage />} />
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