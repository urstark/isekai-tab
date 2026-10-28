import type { WallpaperItem, SortFilter, TimeFilter } from '../types';

export async function fetchWallhavenWallpapers(options: {
  sort?: SortFilter;
  time?: TimeFilter;
  nsfw?: boolean;
  page?: number;
}): Promise<WallpaperItem[]> {
  const { sort = 'hot', time = 'week', nsfw = false } = options;
  const page = options.page ?? (sort === 'new' ? 1 : Math.floor(Math.random() * 3) + 1);

  let sorting = 'toplist';
  let topRange = '1w';
  let q = '';

  if (sort === 'hot') {
    sorting = 'hot';
  } else if (sort === 'new') {
    sorting = 'date_added';
  } else if (sort === 'relevance') {
    sorting = 'relevance';
    q = nsfw ? 'anime girl' : 'anime';
  } else if (sort === 'top') {
    if (time === 'all') {
      sorting = 'favorites';
    } else {
      sorting = 'toplist';
    }
  }

  if (time === 'hour' || time === 'day') topRange = '1d';
  else if (time === 'week') topRange = '1w';
  else if (time === 'month') topRange = '1M';
  else if (time === 'year') topRange = '1y';

  // 010 = Anime category. Purity: 100 = SFW, 010 = Sketchy / Ecchi anime
  const purity = nsfw ? '010' : '100';

  const params = new URLSearchParams({
    categories: '010',
    purity,
    sorting,
    ratios: '16x9,16x10,21x9',
    atleast: '1920x1080',
    page: String(page),
  });

  if (q) params.set('q', q);
  if (sorting === 'toplist') params.set('topRange', topRange);

  const res = await fetch(`https://wallhaven.cc/api/v1/search?${params}`);
  if (!res.ok) {
    throw new Error(`Wallhaven API returned ${res.status}`);
  }

  const json = await res.json();
  if (!json.data || !Array.isArray(json.data)) {
    return [];
  }

  const items: WallpaperItem[] = json.data.map((item: any) => {
    const is4K = item.dimension_x >= 3840;
    const is2K = item.dimension_x >= 2560 && !is4K;
    const qualityTag = is4K ? '4K UHD' : is2K ? '2K QHD' : 'FHD';
    const cleanRes = `${item.dimension_x} × ${item.dimension_y} • ${qualityTag}`;

    const rawSource = item.source || '';
    let platform = 'Wallhaven';
    if (rawSource.includes('pixiv.net')) platform = 'Pixiv';
    else if (rawSource.includes('artstation.com')) platform = 'ArtStation';
    else if (rawSource.includes('twitter.com') || rawSource.includes('x.com')) platform = 'Twitter';
    else if (rawSource.includes('deviantart.com')) platform = 'DeviantArt';

    const sourceLabel = platform !== 'Wallhaven' ? `${platform} (via Wallhaven)` : 'Wallhaven';

    return {
      id: `wh-${item.id}`,
      title: `Anime Artwork • ${item.id}`,
      author: sourceLabel,
      res: cleanRes,
      url: item.path,
      thumbnailUrl: item.thumbs?.large || item.thumbs?.original || item.path,
      sourceUrl: item.source || item.url,
      subreddit: sourceLabel,
      favorite: false,
      isNsfw: item.purity === 'nsfw',
    };
  });

  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j]!, items[i]!];
  }

  return items;
}
