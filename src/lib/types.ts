export interface WallpaperItem {
  id: string;
  title: string;
  author: string;
  res: string;
  url: string;
  thumbnailUrl: string;
  sourceUrl: string;
  subreddit?: string;
  favorite: boolean;
  isNsfw?: boolean;
}

export type SortFilter = 'relevance' | 'hot' | 'top' | 'new';
export type TimeFilter = 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
export type MenuTab = 'history' | 'settings' | 'shortcuts' | 'custom';
export type ClockPosition = 'left' | 'center';
export type MenuDockVisibility = 'hover' | 'always';
export type IndividualSource = 'wallhaven' | 'konachan' | 'github' | 'cozypixels' | 'custom';
export type WallpaperSource = 'wallhaven' | 'konachan' | 'github' | 'cozypixels' | 'hybrid' | 'custom';

export type GitHubRepoId = 'nordic' | 'gruvbox' | 'aesthetic' | 'cozypixels';

export interface GitHubRepoMeta {
  id: GitHubRepoId;
  label: string;
  name: string;
  repo: string;
  desc: string;
}

export const GITHUB_REPOS: GitHubRepoMeta[] = [
  { id: 'nordic', label: 'Nordic Linux', name: 'Nordic Linux', repo: 'linuxdotexe/nordic-wallpapers', desc: 'Minimal Nordic ricing' },
  { id: 'gruvbox', label: 'Gruvbox Ricing', name: 'Gruvbox Ricing', repo: 'AngelJumbo/gruvbox-wallpapers', desc: 'Gruvbox Linux & Anime' },
  { id: 'aesthetic', label: 'Aesthetic Anime', name: 'Aesthetic Anime', repo: 'D3Ext/aesthetic-wallpapers', desc: 'Cyberpunk & Pixel art' },
  { id: 'cozypixels', label: 'CozyPixels', name: 'CozyPixels', repo: 'SleepyCatHey/CozyPixels', desc: 'Cozy Anime Pixels' },
];

export interface PresetFont {
  id: string;
  name: string;
  family: string;
  category: 'sans' | 'mono' | 'display';
  previewText?: string;
}

export type QuickHudPosition = 'right' | 'top' | 'hidden';

export interface AppSettings {
  soundEffects: boolean;
  rerollFlash: boolean;
  clock24h: boolean;
  showSeconds: boolean;
  showTime: boolean;
  showDate: boolean;
  showWallpaperDetails: boolean;
  clockPosition: ClockPosition;
  showAttribution: boolean;
  showVersionBadge: boolean;
  menuDockVisibility: MenuDockVisibility;
  wallpaperSource: WallpaperSource;
  enabledSources: IndividualSource[];
  enabledGitHubRepos: GitHubRepoId[];
  showBottomMenuBtn: boolean;
  fontHeading: string;
  fontBody: string;
  customFontHeadingName?: string;
  quickHudPosition?: QuickHudPosition;
}

export interface AppTheme {
  primary: string;
  backgroundDim: number;
}
