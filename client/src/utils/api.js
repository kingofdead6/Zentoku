const BASE = 'https://api.jikan.moe/v4';

// hentai, erotica, ecchi, doujinshi
const ADULT_EXCLUDE = 'genres_exclude=12,49,9,43';

/* =========================
   ANIME (ordered by score)
========================= */
export const fetchAnime = async (page = 1, search = '') => {
  const url = search
    ? `${BASE}/anime?q=${encodeURIComponent(search)}&page=${page}&limit=25&order_by=score&sort=desc&${ADULT_EXCLUDE}`
    : `${BASE}/anime?page=${page}&limit=25&order_by=score&sort=desc&${ADULT_EXCLUDE}`;

  const res = await fetch(url);
  const json = await res.json();

  return {
    items: json.data.map(a => ({
      id: a.mal_id,
      title: a.title,
      image: a.images.jpg.large_image_url,
      year: a.year,
      count: a.episodes,
      genres: a.genres.map(g => g.name),
      type: 'anime',
      score: a.score ?? 0,
      description: a.synopsis || '', // added description
    })),
    hasNextPage: json.pagination.has_next_page,
  };
};

/* =========================
   MANGA + MANHWA (ordered)
========================= */
async function fetchMangaType(type, page, search) {
  const url = search
    ? `${BASE}/manga?q=${encodeURIComponent(search)}&type=${type}&page=${page}&limit=25&order_by=score&sort=desc&${ADULT_EXCLUDE}`
    : `${BASE}/manga?type=${type}&page=${page}&limit=25&order_by=score&sort=desc&${ADULT_EXCLUDE}`;

  const res = await fetch(url);
  return res.json();
}

export const fetchManga = async (page = 1, search = '') => {
  const [mangaRes, manhwaRes] = await Promise.all([
    fetchMangaType('manga', page, search),
    fetchMangaType('manhwa', page, search),
  ]);

  const merged = [...mangaRes.data, ...manhwaRes.data]
    .map(m => ({
      id: m.mal_id,
      title: m.title,
      image: m.images?.jpg?.large_image_url,
      year: m.year,
      count: m.chapters,
      genres: m.genres.map(g => g.name),
      type: m.type.toLowerCase(),
      score: m.score ?? 0,
      description: m.synopsis || '', // added description
    }))
    .sort((a, b) => b.score - a.score);

  return {
    items: merged,
    hasNextPage:
      mangaRes.pagination.has_next_page ||
      manhwaRes.pagination.has_next_page,
  };
};

/* =========================
   SHOWS (TVMaze)
========================= */
export const fetchShows = async (page = 0) => {
  const res = await fetch(`https://api.tvmaze.com/shows?page=${page}`);
  const data = await res.json();
  return data.slice(0, 100).map(s => ({
    id: s.id,
    title: s.name,
    image: s.image?.medium || 'https://via.placeholder.com/300x400?text=No+Image',
    year: s.premiered ? new Date(s.premiered).getFullYear() : null,
    count: s.runtime || null,
    genres: s.genres || [],
    type: 'show',
    description: s.summary ? s.summary.replace(/<[^>]+>/g, '') : '', // clean HTML
  }));
};

/* =========================
   BOOKS / WEB NOVELS
========================= */
export const fetchBooks = async (page = 1, search = '') => {
  const query = search || 'web novel fantasy';

  const res = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(
      query
    )}&page=${page}&limit=25&fields=key,title,author_name,first_publish_year,subject,cover_i`
  );

  const json = await res.json();

  return {
    items: json.docs
      .filter(b => b.cover_i)
      .map(b => ({
        id: b.key,
        title: b.title,
        image: `https://covers.openlibrary.org/b/id/${b.cover_i}-L.jpg`,
        year: b.first_publish_year || null,
        genres: b.subject?.slice(0, 5) || [],
        type: 'book',
        author: b.author_name?.[0] || 'Unknown',
        description: b.subject?.join(', ') || '', 
      })),
    hasNextPage: json.numFound > page * 25,
  };
};
