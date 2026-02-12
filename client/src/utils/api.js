const BASE = 'https://api.jikan.moe/v4';
const ADULT_EXCLUDE = 'genres_exclude=12,49,9,43';


const fetchAniListEpisodes = async (title) => {
  const query = `
    query ($search: String) {
      Media(search: $search, type: ANIME) {
        episodes
        nextAiringEpisode {
          episode
        }
      }
    }
  `;

  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: { search: title },
    }),
  });

  const json = await res.json();
  const media = json.data.Media;

  if (media.episodes) return media.episodes;
  if (media.nextAiringEpisode)
    return media.nextAiringEpisode.episode - 1;

  return 0;
};

export const fetchAnime = async (page = 1, search = '') => {
  const url = search
    ? `${BASE}/anime?q=${encodeURIComponent(search)}&page=${page}&limit=25&order_by=score&sort=desc&${ADULT_EXCLUDE}`
    : `${BASE}/anime?page=${page}&limit=25&order_by=score&sort=desc&${ADULT_EXCLUDE}`;

  const res = await fetch(url);
  const json = await res.json();

  const items = await Promise.all(
    json.data.map(async (a) => {
      let count = a.episodes;

      if (count === null) {
        count = await fetchAniListEpisodes(a.title);
      }

      return {
        id: a.mal_id,
        title: a.title,
        image: a.images.jpg.large_image_url,
        year: a.year,
        count: count ?? 0,
        genres: a.genres.map(g => g.name),
        type: 'anime',
        score: a.score ?? 0,
        description: a.synopsis || '',
      };
    })
  );

  return {
    items,
    hasNextPage: json.pagination.has_next_page,
  };
};


const fetchAniListMangaChapters = async (title) => {
  const query = `
    query ($search: String) {
      Media(search: $search, type: MANGA) {
        chapters
      }
    }
  `;

  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: { search: title },
      }),
    });

    const json = await res.json();
    const media = json.data?.Media;

    if (media?.chapters) return media.chapters;

    return 'Ongoing';
  } catch (err) {
    console.error('AniList fetch error:', err);
    return 'Ongoing';
  }
};

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

  const merged = [...mangaRes.data, ...manhwaRes.data];

  const items = await Promise.all(
    merged.map(async (m) => {
      let count = m.chapters;

      if (count === null) {
        count = await fetchAniListMangaChapters(m.title);
      }

      return {
        id: m.mal_id,
        title: m.title,
        image: m.images?.jpg?.large_image_url,
        year: m.year,
        count: count ?? 'Ongoing',
        genres: m.genres.map((g) => g.name),
        type: m.type.toLowerCase(),
        score: m.score ?? 0,
        description: m.synopsis || '',
      };
    })
  );

  return {
    items: items.sort((a, b) => b.score - a.score),
    hasNextPage:
      mangaRes.pagination.has_next_page || manhwaRes.pagination.has_next_page,
  };
};

export const fetchShows = async (page = 0) => {
  const res = await fetch(`https://api.tvmaze.com/shows?page=${page}`);
  const data = await res.json();

  return data
    .map(s => ({
      id: s.id,
      title: s.name,
      image: s.image?.medium || 'https://via.placeholder.com/300x400?text=No+Image',
      year: s.premiered ? new Date(s.premiered).getFullYear() : null,
      count: s.runtime || null,
      genres: s.genres || [],
      score: s.rating?.average ?? 0,
      type: 'show',
      description: s.summary ? s.summary.replace(/<[^>]+>/g, '') : '',
    }))
    .sort((a, b) => b.score - a.score); 
};

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
