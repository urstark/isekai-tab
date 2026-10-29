import type { WallpaperItem, SortFilter, TimeFilter, ImageQuality } from '../types';
import { fetchJsonSafe } from './fetch';

const CACHE_KEY = 'isekai_cache_wallhaven_items';

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

async function getCachedWallhavenWallpapers(): Promise<WallpaperItem[]> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      const data = await chrome.storage.local.get(CACHE_KEY);
      const entry = data[CACHE_KEY] as { items?: WallpaperItem[]; timestamp?: number } | undefined;
      if (entry?.items && Array.isArray(entry.items) && entry.items.length > 0) {
        return entry.items;
      }
    } else if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.items) && parsed.items.length > 0) {
          return parsed.items;
        }
      }
    }
  } catch {
  }
  return [];
}

async function saveCachedWallhavenWallpapers(items: WallpaperItem[]): Promise<void> {
  if (!items || items.length === 0) return;
  const payload = { items: items.slice(0, 60), timestamp: Date.now() };
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.set({ [CACHE_KEY]: payload });
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    }
  } catch {
  }
}

export async function fetchWallhavenWallpapers(options: {
  sort?: SortFilter;
  time?: TimeFilter;
  nsfw?: boolean;
  page?: number;
  quality?: ImageQuality;
}): Promise<WallpaperItem[]> {
  const { sort = 'hot', time = 'week', nsfw = false, quality = 'balanced' } = options;
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

  try {
    const json = await fetchJsonSafe<{
      data?: Array<{
        id: string;
        path: string;
        dimension_x: number;
        dimension_y: number;
        resolution?: string;
        thumbs?: { large?: string; original?: string; small?: string };
        source?: string;
        url?: string;
        purity?: string;
      }>
    }>(`https://wallhaven.cc/api/v1/search?${params}`, 8000);
    if (!json.data || !Array.isArray(json.data) || json.data.length === 0) {
      const cached = await getCachedWallhavenWallpapers();
      return cached.length > 0 ? shuffle(cached) : [];
    }

    const isBalanced = quality === 'balanced';

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

      const mainUrl = isBalanced
        ? item.thumbs?.large || item.path
        : item.path;

      const thumbUrl = isBalanced
        ? item.thumbs?.small || item.thumbs?.large || item.path
        : item.thumbs?.large || item.thumbs?.original || item.path;

      return {
        id: `wh-${item.id}`,
        title: `Anime Artwork • ${item.id}`,
        author: sourceLabel,
        res: cleanRes,
        url: mainUrl,
        thumbnailUrl: thumbUrl,
        sourceUrl: item.source || item.url,
        sourceName: sourceLabel,
        favorite: false,
        isNsfw: item.purity === 'nsfw',
      };
    });

    await saveCachedWallhavenWallpapers(items);
    return shuffle(items);
  } catch (err) {
    const cached = await getCachedWallhavenWallpapers();
    if (cached.length > 0) {
      return shuffle(cached);
    }
    throw err;
  }
}
