import type { WallpaperItem, SortFilter, TimeFilter, ImageQuality } from '../types';
import { fetchJsonSafe } from './fetch';

interface MoebooruPost {
  id: number;
  tags: string;
  author: string;
  source?: string;
  score: number;
  width: number;
  height: number;
  file_url: string;
  jpeg_url?: string;
  sample_url?: string;
  preview_url?: string;
  rating: 's' | 'q' | 'e';
}

function cleanBooruTags(rawTags: string): string {
  const ignoredPrefixes = ['tagme', 'bad_id', 'duplicate', 'wallpaper', 'highres'];
  const words = rawTags
    .split(/\s+/)
    .filter((t) => !ignoredPrefixes.includes(t.toLowerCase()) && !t.includes(':'))
    .map((w) => w.replace(/_/g, ' '));

  const titleWords = words.slice(0, 3);
  if (titleWords.length === 0) return 'Anime Artwork';

  return titleWords
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' • ');
}

async function fetchFromMoebooru(
  endpointUrl: string,
  siteName: string,
  isNsfw = false,
  quality: ImageQuality = 'balanced'
): Promise<WallpaperItem[]> {
  try {
    const posts = await fetchJsonSafe<MoebooruPost[]>(endpointUrl, 9000);
    if (!Array.isArray(posts)) return [];

    const isBalanced = quality === 'balanced';

    return posts
      .filter((p) => p.width && p.height && (p.sample_url || p.jpeg_url || p.file_url))
      .map((p) => {
        const is4K = p.width >= 3840;
        const is2K = p.width >= 2560 && !is4K;
        const qualityTag = is4K ? '4K UHD' : is2K ? '2K QHD' : 'FHD';
        const cleanRes = `${p.width} × ${p.height} • ${qualityTag}`;

        const title = cleanBooruTags(p.tags);
        const fallbackUrl = p.file_url || p.sample_url || p.jpeg_url || '';
        const imageUrl = (isBalanced
          ? p.sample_url || p.jpeg_url || fallbackUrl
          : p.file_url || p.jpeg_url || fallbackUrl) || fallbackUrl;
        const thumb = (isBalanced
          ? p.preview_url || p.sample_url || imageUrl
          : p.sample_url || p.preview_url || imageUrl) || imageUrl;
        const isPostNsfw = p.rating !== 's' || isNsfw;

        let sourceLink = p.source;
        if (!sourceLink || !sourceLink.startsWith('http')) {
          sourceLink = siteName.toLowerCase().includes('yande')
            ? `https://yande.re/post/show/${p.id}`
            : `https://konachan.net/post/show/${p.id}`;
        }

        return {
          id: `${siteName.toLowerCase().slice(0, 2)}-${p.id}`,
          title,
          author: p.author ? `${p.author} (${siteName})` : siteName,
          res: cleanRes,
          url: imageUrl,
          thumbnailUrl: thumb,
          sourceUrl: sourceLink,
          sourceName: `${siteName} ${isPostNsfw ? 'Waifu' : 'Anime'}`,
          favorite: false,
          isNsfw: isPostNsfw,
        };
      });
  } catch (err) {
    console.warn(`Error fetching ${siteName}:`, err);
    return [];
  }
}

export async function fetchKonachanWallpapers(options: {
  sort?: SortFilter;
  time?: TimeFilter;
  nsfw?: boolean;
  quality?: ImageQuality;
}): Promise<WallpaperItem[]> {
  const { sort = 'hot', nsfw = false, quality = 'balanced' } = options;
  const page = sort === 'new' ? 1 : Math.floor(Math.random() * 4) + 1;

  let orderTag = 'order:score';
  if (sort === 'new') orderTag = 'order:id';
  else if (sort === 'hot' || sort === 'relevance') orderTag = 'order:score';

  const items: WallpaperItem[] = [];

  if (nsfw) {
    const yandeUrl = `https://yande.re/post.json?limit=50&page=${page}&tags=rating:questionable+width:1920..+${orderTag}`;
    const nsfwItems = await fetchFromMoebooru(yandeUrl, 'Yande.re', true, quality);
    items.push(...nsfwItems);
  } else {
    const [kcItems, ydItems] = await Promise.all([
      fetchFromMoebooru(
        `https://konachan.net/post.json?limit=40&page=${page}&tags=rating:safe+width:1920..+${orderTag}`,
        'Konachan',
        false,
        quality
      ),
      fetchFromMoebooru(
        `https://yande.re/post.json?limit=30&page=${page}&tags=rating:safe+width:1920..+${orderTag}`,
        'Yande.re',
        false,
        quality
      ),
    ]);

    items.push(...kcItems, ...ydItems);
  }

  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j]!, items[i]!];
  }

  return items;
}
