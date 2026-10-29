import type { WallpaperItem, SortFilter, TimeFilter, WallpaperSource, IndividualSource, GitHubRepoId, ImageQuality } from '../types';
import { fetchWallhavenWallpapers } from './wallhaven';
import { fetchKonachanWallpapers } from './konachan';
import { fetchGitHubWallpapers } from './github';
import { getAllCustomWallpapers, convertStoredToWallpaperItem } from '../db';

export interface FetchOptions {
  source?: WallpaperSource;
  sources?: IndividualSource[];
  githubRepos?: GitHubRepoId[];
  sort?: SortFilter;
  time?: TimeFilter;
  nsfw?: boolean;
  quality?: ImageQuality;
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

export async function fetchWallpapers(options: FetchOptions): Promise<WallpaperItem[]> {
  const { sort = 'hot', time = 'week', nsfw = false, quality = 'balanced' } = options;

  let targetSources: IndividualSource[] = [];
  if (options.sources && options.sources.length > 0) {
    targetSources = options.sources;
  } else if (options.source && options.source !== 'hybrid') {
    targetSources = [options.source as IndividualSource];
  } else {
    targetSources = ['wallhaven', 'konachan', 'cozypixels', 'custom'];
  }

  let results: WallpaperItem[] = [];

  try {
    const promises: Promise<WallpaperItem[]>[] = targetSources.map(async (src) => {
      try {
        if (src === 'custom') {
          const stored = await getAllCustomWallpapers();
          return shuffle(stored.map(convertStoredToWallpaperItem));
        } else if (src === 'wallhaven') {
          return await fetchWallhavenWallpapers({ sort, time, nsfw, quality });
        } else if (src === 'konachan') {
          return await fetchKonachanWallpapers({ sort, time, nsfw, quality });
        } else if (src === 'cozypixels' || (src as string) === 'github') {
          return await fetchGitHubWallpapers(options.githubRepos);
        }
        return [];
      } catch (err) {
        console.warn(`Source ${src} fetch error:`, err);
        return [];
      }
    });

    const settled = await Promise.allSettled(promises);
    const pools = settled
      .map((s) => (s.status === 'fulfilled' ? s.value : []))
      .filter((p) => p.length > 0);

    if (pools.length === 1) {
      results = pools[0]!;
    } else if (pools.length > 1) {
      const maxLen = Math.max(...pools.map((p) => p.length), 0);
      for (let i = 0; i < maxLen; i++) {
        const roundItems = pools.map((p) => p[i]).filter(Boolean) as WallpaperItem[];
        results.push(...shuffle(roundItems));
      }
    }
  } catch (err) {
    console.warn('Failed to aggregate wallpapers:', err);
  }

  // fall back to Wallhaven then CozyPixels so the app never freezes with an empty wallpaper pool
  if (results.length === 0) {
    console.warn('All target sources returned 0 wallpapers; activating graceful fallback.');
    try {
      results = await fetchWallhavenWallpapers({ sort, time, nsfw, quality });
    } catch {
      try {
        results = await fetchGitHubWallpapers(['cozypixels']);
      } catch {
        results = [];
      }
    }
  }

  return results;
}
