import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import AnimePage from './pages/AnimeSection';
import MangaPage from './pages/MangaSection';
import ShowsPage from './pages/ShowsSection';
import BooksPage from './pages/BooksSection';

function Layout() {
  return (
    <div className="bg-zinc-950 text-white min-h-screen">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 ml-72 pt-24 pb-16 px-6 md:px-12 max-w-screen-2xl mx-auto">
          <Outlet />           {/* ← Pages render here */}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<AnimePage />} />           {/* default home = anime */}
          <Route path="/anime" element={<AnimePage />} />
          <Route path="/manga" element={<MangaPage />} />
          <Route path="/shows" element={<ShowsPage />} />
          <Route path="/books" element={<BooksPage />} />
          {/* Optional: 404 */}
          <Route path="*" element={<div className="text-center py-40 text-2xl">404 - Page not found</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;