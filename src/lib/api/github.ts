import type { WallpaperItem, GitHubRepoId } from '../types';
import { fetchJsonSafe } from './fetch';
import cozyPathsFallback from './cozypixels-paths.json';
import laustoicPathsFallback from './laustoic-paths.json';

const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

function encodePath(filePath: string): string {
  return filePath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
}

function cleanTitleFromPath(filePath: string): string {
  const parts = filePath.split('/');
  const filename = parts[parts.length - 1] || filePath;
  const rawName = filename.replace(/\.[^/.]+$/, '');
  const clean = rawName
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return clean
    .split(' ')
    .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
    .join(' ');
}

async function getCachedPaths(storageKey: string, fallback: string[]): Promise<string[]> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      const data = await chrome.storage.local.get(storageKey);
      const entry = data[storageKey] as { paths?: string[]; timestamp?: number } | undefined;
      if (entry && Array.isArray(entry.paths) && entry.paths.length > 0 && entry.timestamp) {
        if (Date.now() - entry.timestamp < CACHE_TTL_MS) {
          return entry.paths;
        }
      }
    } else if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.paths) && parsed.paths.length > 0) {
          if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
            return parsed.paths;
          }
        }
      }
    }
  } catch (e) {
    console.warn(`Error reading cached paths for ${storageKey}:`, e);
  }
  return fallback;
}

async function saveCachedPaths(storageKey: string, paths: string[]): Promise<void> {
  const payload = { paths, timestamp: Date.now() };
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.set({ [storageKey]: payload });
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify(payload));
    }
  } catch (e) {
    console.warn(`Error saving cached paths for ${storageKey}:`, e);
  }
}

async function getRepoImagePaths(
  repoFullName: string,
  storageKey: string,
  fallbackPaths: string[] = [],
  branch = 'main'
): Promise<string[]> {
  const cached = await getCachedPaths(storageKey, fallbackPaths);

  if (cached !== fallbackPaths && cached.length > 0) {
    return cached;
  }

  try {
    const json = await fetchJsonSafe<{ tree?: Array<{ type: string; path: string }> }>(
      `https://api.github.com/repos/${repoFullName}/git/trees/${branch}?recursive=1`,
      6000
    );
    if (json && Array.isArray(json.tree)) {
      const discovered = json.tree
        .filter(
            (t: any) =>
              t.type === 'blob' &&
              /\.(jpe?g|png|webp)$/i.test(t.path) &&
              !t.path.toLowerCase().includes('banner') &&
              !t.path.toLowerCase().includes('readme') &&
              !t.path.toLowerCase().includes('.github')
          )
          .map((t: any) => t.path as string);

        if (discovered.length > 0) {
          await saveCachedPaths(storageKey, discovered);
          return discovered;
        }
      }
  } catch (err) {
    console.warn(`GitHub API tree fetch failed for ${repoFullName}, using fallback:`, err);
  }

  return fallbackPaths;
}

export async function fetchGitHubWallpapers(enabledRepos?: GitHubRepoId[]): Promise<WallpaperItem[]> {
  const activeRepos = new Set(
    enabledRepos && enabledRepos.length > 0
      ? enabledRepos
      : (['nordic', 'gruvbox', 'aesthetic', 'cozypixels'] as GitHubRepoId[])
  );

  const fetchPromises: Promise<void>[] = [];
  const items: WallpaperItem[] = [];

  if (activeRepos.has('nordic')) {
    fetchPromises.push(
      getRepoImagePaths('linuxdotexe/nordic-wallpapers', 'isekai_cache_nordic_paths', [], 'master')
        .then((paths) => {
          const selected = shuffle(paths).slice(0, 25);
          for (const path of selected) {
            const encoded = encodePath(path);
            const title = cleanTitleFromPath(path) || 'Nordic Wallpaper';
            const rawUrl = `https://raw.githubusercontent.com/linuxdotexe/nordic-wallpapers/master/${encoded}`;
            items.push({
              id: `gh-nord-${encodeURIComponent(path)}`,
              title,
              author: 'linuxdotexe/nordic',
              res: '3840 × 2160 • 4K UHD',
              url: rawUrl,
              thumbnailUrl: rawUrl,
              sourceUrl: `https://github.com/linuxdotexe/nordic-wallpapers/blob/master/${encoded}`,
              sourceName: 'GitHub (Nordic Linux)',
              favorite: false,
            });
          }
        })
    );
  }

  if (activeRepos.has('gruvbox')) {
    fetchPromises.push(
      getRepoImagePaths('AngelJumbo/gruvbox-wallpapers', 'isekai_cache_gruvbox_paths', [], 'main')
        .then((paths) => {
          const selected = shuffle(paths).slice(0, 25);
          for (const path of selected) {
            const encoded = encodePath(path);
            const title = cleanTitleFromPath(path) || 'Gruvbox Wallpaper';
            const rawUrl = `https://raw.githubusercontent.com/AngelJumbo/gruvbox-wallpapers/main/${encoded}`;
            items.push({
              id: `gh-gruv-${encodeURIComponent(path)}`,
              title,
              author: 'AngelJumbo/gruvbox',
              res: '2560 × 1440 • 2K QHD',
              url: rawUrl,
              thumbnailUrl: rawUrl,
              sourceUrl: `https://github.com/AngelJumbo/gruvbox-wallpapers/blob/main/${encoded}`,
              sourceName: 'GitHub (Gruvbox Ricing)',
              favorite: false,
            });
          }
        })
    );
  }

  if (activeRepos.has('aesthetic')) {
    fetchPromises.push(
      getRepoImagePaths('D3Ext/aesthetic-wallpapers', 'isekai_cache_aesthetic_paths', [], 'main')
        .then((paths) => {
          const selected = shuffle(paths).slice(0, 25);
          for (const path of selected) {
            const encoded = encodePath(path);
            const title = cleanTitleFromPath(path) || 'Aesthetic Wallpaper';
            const rawUrl = `https://raw.githubusercontent.com/D3Ext/aesthetic-wallpapers/main/${encoded}`;
            items.push({
              id: `gh-aes-${encodeURIComponent(path)}`,
              title,
              author: 'D3Ext/aesthetic',
              res: '3840 × 2160 • 4K UHD',
              url: rawUrl,
              thumbnailUrl: rawUrl,
              sourceUrl: `https://github.com/D3Ext/aesthetic-wallpapers/blob/main/${encoded}`,
              sourceName: 'GitHub (Aesthetic Anime)',
              favorite: false,
            });
          }
        })
    );
  }

  if (activeRepos.has('cozypixels')) {
    fetchPromises.push(
      getRepoImagePaths('SleepyCatHey/CozyPixels', 'isekai_cache_cozypixels_paths', cozyPathsFallback as string[], 'main')
        .then((paths) => {
          const selected = shuffle(paths).slice(0, 25);
          for (const path of selected) {
            const encoded = encodePath(path);
            const title = cleanTitleFromPath(path) || 'Cozy Pixel Wallpaper';
            const rawUrl = `https://raw.githubusercontent.com/SleepyCatHey/CozyPixels/main/${encoded}`;
            items.push({
              id: `gh-cozy-${encodeURIComponent(path)}`,
              title,
              author: 'SleepyCatHey/CozyPixels',
              res: '3840 × 2160 • 4K UHD',
              url: rawUrl,
              thumbnailUrl: rawUrl,
              sourceUrl: `https://github.com/SleepyCatHey/CozyPixels/blob/main/${encoded}`,
              sourceName: 'GitHub (CozyPixels)',
              favorite: false,
            });
          }
        })
    );
  }

  await Promise.all(fetchPromises);
  return shuffle(items);
}

export async function fetchCozyPixelsWallpapers(enabledRepos?: GitHubRepoId[]): Promise<WallpaperItem[]> {
  return await fetchGitHubWallpapers(enabledRepos);
}

export async function fetchLaustoicWallpapers(): Promise<WallpaperItem[]> {
  const paths = await getRepoImagePaths(
    'laustoic/laustoic-wallpaper-repo',
    'isekai_cache_laustoic_paths',
    laustoicPathsFallback as string[]
  );

  const shuffled = shuffle(paths);
  const selected = shuffled.slice(0, 54);

  return selected.map((filePath, idx) => {
    const parts = filePath.split('/');
    const category = parts.length > 1 ? parts.slice(0, -1).join(' • ') : 'Wallpapers';
    const title = cleanTitleFromPath(filePath) || `Anime Wallpaper #${idx + 1}`;
    const encoded = encodePath(filePath);
    const rawUrl = `https://raw.githubusercontent.com/laustoic/laustoic-wallpaper-repo/main/${encoded}`;

    return {
      id: `laustoic-${encodeURIComponent(filePath)}`,
      title,
      author: 'laustoic/wallpaper-repo',
      res: '2560 × 1440 • 2K QHD',
      url: rawUrl,
      thumbnailUrl: rawUrl,
      sourceUrl: `https://github.com/laustoic/laustoic-wallpaper-repo/blob/main/${encoded}`,
      sourceName: category !== 'Wallpapers' ? `Linux Hub (${category})` : 'Linux Wallpaper Hub',
      favorite: false,
    };
  });
}
