import type { WallpaperItem, SortFilter, TimeFilter, MenuTab, AppSettings, AppTheme, WallpaperSource, IndividualSource, GitHubRepoId, ImageQuality } from './types';
import { playRollSound, hexToRgb } from './sound';
import { fetchWallpapers } from './api';
import {
  saveCustomWallpaper,
  getAllCustomWallpapers,
  deleteCustomWallpaper,
  convertStoredToWallpaperItem,
} from './db';
import {
  PRESET_FONTS,
  loadAndApplyCustomFont,
  registerCustomFontFile,
  removeCustomFont,
} from './fonts';

export const COLOR_PRESETS = [
  '#ffffff',
  '#38bdf8',
  '#a855f7',
  '#2ee59d',
  '#f59e0b',
  '#f43f5e',
  '#ff6b6b',
];

export const BRAND_FALLBACK_WALLPAPER: WallpaperItem = {
  id: 'brand-fallback',
  title: 'Isekai Tab',
  author: 'Dynamic Hub',
  res: 'Dynamic Resolution',
  url: '',
  thumbnailUrl: '',
  sourceUrl: '',
  sourceName: 'Isekai Tab',
  favorite: false,
};

export function getWallpaperSource(item: WallpaperItem): IndividualSource {
  if (item.id.startsWith('custom-')) return 'custom';
  const name = item.sourceName || '';
  if (
    item.id.startsWith('kc-') ||
    item.id.startsWith('ya-') ||
    (name.includes('Konachan') || name.includes('Yande.re'))
  ) {
    return 'konachan';
  }
  if (
    item.id.startsWith('cp-') ||
    item.id.startsWith('gh-') ||
    item.id.startsWith('cozy-') ||
    item.id.startsWith('laustoic-') ||
    item.author?.includes('CozyPixels') ||
    name.includes('GitHub') ||
    name.includes('CozyPixels') ||
    name.includes('Linux')
  ) {
    return 'cozypixels';
  }
  return 'wallhaven';
}

const STORAGE_KEY = 'isekai_tab_v1';

interface PersistentState {
  currentWallpaper?: WallpaperItem;
  history?: WallpaperItem[];
  historyIndex?: number;
  wallpaperQueue?: WallpaperItem[];
  sort?: SortFilter;
  time?: TimeFilter;
  nsfw?: boolean;
  pinned?: boolean;
  incognito?: boolean;
  showFavoritesOnly?: boolean;
  theme?: AppTheme;
  settings?: AppSettings;
}

function createThumbnailFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 320;
        const scale = Math.min(1, MAX_WIDTH / img.width);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

class Store {
  private isHydrated = false;
  isFetching = $state<boolean>(false);
  wallpaperQueue = $state<WallpaperItem[]>([]);
  customWallpapers = $state<WallpaperItem[]>([]);

  currentWallpaper = $state<WallpaperItem>(BRAND_FALLBACK_WALLPAPER);
  history = $state<WallpaperItem[]>([]);
  historyIndex = $state<number>(0);

  sort = $state<SortFilter>('hot');
  time = $state<TimeFilter>('week');

  isLoading = $state<boolean>(true);
  nsfw = $state<boolean>(false);
  pinned = $state<boolean>(false);
  incognito = $state<boolean>(false);
  isMenuVisible = $state<boolean>(false);
  isCommandPaletteOpen = $state<boolean>(false);
  isRolling = $state<boolean>(false);
  showRollOverlay = $state<boolean>(false);

  activeTab = $state<MenuTab>('history');
  showFavoritesOnly = $state<boolean>(false);
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;

  theme = $state<AppTheme>({
    primary: '#ffffff',
    backgroundDim: 0.32,
  });

  settings = $state<AppSettings>({
    soundEffects: true,
    rerollFlash: true,
    clock24h: false,
    showSeconds: false,
    showTime: true,
    showDate: true,
    showWallpaperDetails: true,
    clockPosition: 'left',
    showAttribution: true,
    showVersionBadge: true,
    menuDockVisibility: 'hover',
    wallpaperSource: 'hybrid',
    enabledSources: ['wallhaven', 'konachan', 'cozypixels', 'custom'],
    enabledGitHubRepos: ['nordic', 'gruvbox', 'aesthetic', 'cozypixels'],
    showBottomMenuBtn: false,
    fontHeading: 'montserrat',
    fontBody: 'plus-jakarta',
    customFontHeadingName: undefined,
    quickHudPosition: 'right',
    imageQuality: 'balanced',
    wallhavenApiKey: '',
    wallhavenCategories: { general: false, anime: true, people: false },
  });

  constructor() {
    this.loadState();

    let didRotateOnStart = false;

    if (!this.pinned) {
      this.purgeDisabledSourceItems();
      let nextItem: WallpaperItem | undefined;

      if (this.wallpaperQueue.length > 0) {
        const nextIdx = this.wallpaperQueue.findIndex(
          (x) => x.id !== this.currentWallpaper.id && this.isItemSourceEnabled(x)
        );
        if (nextIdx !== -1) {
          nextItem = this.wallpaperQueue.splice(nextIdx, 1)[0];
        } else if (this.isItemSourceEnabled(this.wallpaperQueue[0]!)) {
          nextItem = this.wallpaperQueue.shift();
        }
      }

      if (nextItem) {
        this.currentWallpaper = nextItem;
        didRotateOnStart = true;
        if (!this.history.some((x) => x.id === nextItem.id)) {
          this.history = [nextItem, ...this.history].slice(0, 50);
          this.historyIndex = 0;
        } else {
          this.historyIndex = this.history.findIndex((x) => x.id === nextItem.id);
        }
      }
    }

    this.applyTheme();
    this.isHydrated = true;
    this.saveState();

    loadAndApplyCustomFont().then((name) => {
      if (name && this.settings.fontHeading === 'custom') {
        this.applyTheme();
      }
    });
    this.loadCustomWallpapers();

    const needsImmediateRotation =
      !didRotateOnStart ||
      !this.currentWallpaper.url ||
      this.currentWallpaper.id === BRAND_FALLBACK_WALLPAPER.id ||
      !this.isItemSourceEnabled(this.currentWallpaper);
    this.loadLiveWallpapers(needsImmediateRotation);

    $effect.root(() => {
      $effect(() => {
        const _ = [
          this.sort,
          this.time,
          this.nsfw,
          this.pinned,
          this.incognito,
          this.showFavoritesOnly,
          this.historyIndex,
          this.wallpaperQueue.length,
          this.theme.primary,
          this.theme.backgroundDim,
          this.settings.showAttribution,
          this.settings.showVersionBadge,
          this.settings.showBottomMenuBtn,
          this.settings.clockPosition,
          this.settings.clock24h,
          this.settings.showSeconds,
          this.settings.showTime,
          this.settings.showDate,
          this.settings.fontHeading,
          this.settings.fontBody,
          this.settings.quickHudPosition,
          this.settings.imageQuality,
          this.settings.wallhavenApiKey,
          this.settings.wallhavenCategories?.general,
          this.settings.wallhavenCategories?.anime,
          this.settings.wallhavenCategories?.people,
          this.currentWallpaper.id,
          this.history.length,
        ];
        this.saveState();
      });
    });
  }

  loadState() {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data: PersistentState = JSON.parse(raw);

      if (data.theme) {
        this.theme = { ...this.theme, ...data.theme };
      }
      if (data.settings) {
        this.settings = {
          ...this.settings,
          ...data.settings,
          enabledSources: Array.isArray(data.settings.enabledSources) && data.settings.enabledSources.length > 0
            ? (data.settings.enabledSources as IndividualSource[])
            : ['wallhaven', 'konachan', 'cozypixels', 'custom'],
          enabledGitHubRepos: Array.isArray(data.settings.enabledGitHubRepos) && data.settings.enabledGitHubRepos.length > 0
            ? data.settings.enabledGitHubRepos
            : ['nordic', 'gruvbox', 'aesthetic', 'cozypixels'],
          showBottomMenuBtn: typeof data.settings.showBottomMenuBtn === 'boolean'
            ? data.settings.showBottomMenuBtn
            : false,
          showVersionBadge: typeof data.settings.showVersionBadge === 'boolean'
            ? data.settings.showVersionBadge
            : true,
          imageQuality: data.settings.imageQuality === 'original' ? 'original' : 'balanced',
          wallhavenApiKey: typeof data.settings.wallhavenApiKey === 'string' ? data.settings.wallhavenApiKey : '',
          wallhavenCategories: data.settings.wallhavenCategories && typeof data.settings.wallhavenCategories === 'object'
            ? {
                general: !!data.settings.wallhavenCategories.general,
                anime: data.settings.wallhavenCategories.anime !== false,
                people: !!data.settings.wallhavenCategories.people,
              }
            : { general: false, anime: true, people: false },
        };
      }
      if (data.sort) this.sort = data.sort;
      if (data.time) this.time = data.time;
      if (typeof data.nsfw === 'boolean') this.nsfw = data.nsfw;
      if (typeof data.pinned === 'boolean') this.pinned = data.pinned;
      if (typeof data.incognito === 'boolean') this.incognito = data.incognito;
      if (typeof data.showFavoritesOnly === 'boolean') this.showFavoritesOnly = data.showFavoritesOnly;
      if (Array.isArray(data.history)) {
        this.history = data.history.filter((x: WallpaperItem) => x.id !== 'wh-pomqg9' && !!x.url);
      }
      if (typeof data.historyIndex === 'number' && this.history[data.historyIndex]) {
        this.historyIndex = data.historyIndex;
      }
      if (
        data.currentWallpaper?.id &&
        data.currentWallpaper.id !== 'wh-pomqg9' &&
        data.currentWallpaper.id !== BRAND_FALLBACK_WALLPAPER.id &&
        data.currentWallpaper.url
      ) {
        this.currentWallpaper = data.currentWallpaper;
      } else if (this.history[this.historyIndex]) {
        this.currentWallpaper = this.history[this.historyIndex]!;
      } else if (this.history[0]) {
        this.currentWallpaper = this.history[0]!;
      } else {
        this.currentWallpaper = BRAND_FALLBACK_WALLPAPER;
      }
      if (Array.isArray(data.wallpaperQueue)) {
        this.wallpaperQueue = data.wallpaperQueue.filter((x: WallpaperItem) => x.id !== 'wh-pomqg9' && !!x.url);
      }
      this.purgeDisabledSourceItems();
    } catch (e) {
      console.warn(`Failed to load isekai state: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  saveState() {
    if (!this.isHydrated || typeof localStorage === 'undefined') return;
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.persistNow();
    }, 150);
  }

  persistNow() {
    if (!this.isHydrated || typeof localStorage === 'undefined') return;
    try {
      const data: PersistentState = {
        currentWallpaper: $state.snapshot(this.currentWallpaper),
        history: $state.snapshot(this.history).slice(0, 30),
        historyIndex: this.historyIndex,
        wallpaperQueue: $state.snapshot(this.wallpaperQueue).slice(0, 20),
        sort: this.sort,
        time: this.time,
        nsfw: this.nsfw,
        pinned: this.pinned,
        incognito: this.incognito,
        showFavoritesOnly: this.showFavoritesOnly,
        theme: $state.snapshot(this.theme),
        settings: $state.snapshot(this.settings),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        chrome.storage.local.set({ [STORAGE_KEY]: data }).catch(() => {});
      }
    } catch (e) {
      console.warn(`Failed to save isekai state: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  applyTheme() {
    if (typeof document === 'undefined') return;
    const { r, g, b } = hexToRgb(this.theme.primary);
    const root = document.documentElement;
    root.style.setProperty('--accent', this.theme.primary);
    root.style.setProperty('--accent-rgb', `${r}, ${g}, ${b}`);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    root.style.setProperty('--accent-contrast', luminance > 0.6 ? '#0a0b0e' : '#ffffff');
    root.style.setProperty('--wallpaper-dim', String(this.theme.backgroundDim));

    const headingPreset = PRESET_FONTS.find((f) => f.id === this.settings.fontHeading);
    if (this.settings.fontHeading === 'custom' && this.settings.customFontHeadingName) {
      const cleanName = this.settings.customFontHeadingName
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_');
      root.style.setProperty('--font-heading', `'UserFont_${cleanName}', sans-serif`);
    } else if (headingPreset) {
      root.style.setProperty('--font-heading', headingPreset.family);
    }

    const bodyPreset = PRESET_FONTS.find((f) => f.id === this.settings.fontBody);
    if (bodyPreset) {
      root.style.setProperty('--font-family', bodyPreset.family);
    }
  }

  isItemSourceEnabled(item: WallpaperItem): boolean {
    return this.settings.enabledSources.includes(getWallpaperSource(item));
  }

  purgeDisabledSourceItems() {
    this.wallpaperQueue = this.wallpaperQueue.filter((item) => this.isItemSourceEnabled(item));
    if (!this.isItemSourceEnabled(this.currentWallpaper) && !this.pinned) {
      if (this.wallpaperQueue.length > 0) {
        this.currentWallpaper = this.wallpaperQueue.shift()!;
      }
    }
  }

  setLoading(val: boolean) {
    this.isLoading = val;
  }

  get isDefaultScreen(): boolean {
    return this.incognito || this.isLoading || !this.currentWallpaper.url;
  }

  async loadCustomWallpapers() {
    try {
      const stored = await getAllCustomWallpapers();
      this.customWallpapers = stored.map(convertStoredToWallpaperItem);
    } catch (err) {
      console.warn(`Failed to load custom wallpapers: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async addCustomWallpaperFiles(files: FileList | File[]) {
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const rawName = file.name.replace(/\.[^/.]+$/, '');
      const cleanTitle = rawName.replace(/[-_]/g, ' ').trim();

      let thumbUrl: string | undefined;
      try {
        thumbUrl = await createThumbnailFromFile(file);
      } catch {
      }

      await saveCustomWallpaper({
        id,
        title: cleanTitle || 'Local Wallpaper',
        author: 'My Wallpapers',
        res: 'Local File',
        blob: file,
        thumbnailDataUrl: thumbUrl,
        createdAt: Date.now(),
      });
    }

    await this.loadCustomWallpapers();
    if (this.settings.wallpaperSource === 'custom' || this.settings.wallpaperSource === 'hybrid') {
      this.loadLiveWallpapers(true);
    }
  }

  async addCustomWallpaperUrl(url: string, title?: string) {
    const trimmed = url.trim();
    if (!trimmed) return;
    const id = `custom-url-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const urlFilename = trimmed.split('/').pop()?.split('#')[0]?.split('?')[0] || 'Web Wallpaper';
    const cleanTitle = title?.trim() || urlFilename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').trim();

    await saveCustomWallpaper({
      id,
      title: cleanTitle || 'Web Wallpaper',
      author: 'Custom URL',
      res: 'Web Image',
      directUrl: trimmed,
      createdAt: Date.now(),
    });

    await this.loadCustomWallpapers();
    if (this.settings.wallpaperSource === 'custom' || this.settings.wallpaperSource === 'hybrid') {
      this.loadLiveWallpapers(true);
    }
  }

  async removeCustomWallpaper(id: string) {
    await deleteCustomWallpaper(id);
    await this.loadCustomWallpapers();
    if (this.currentWallpaper.id === id) {
      this.loadLiveWallpapers(true);
    }
  }

  setFontHeading(fontId: string) {
    this.settings.fontHeading = fontId;
    this.applyTheme();
    this.saveState();
  }

  setFontBody(fontId: string) {
    this.settings.fontBody = fontId;
    this.applyTheme();
    this.saveState();
  }

  async uploadCustomFont(file: File) {
    try {
      const res = await registerCustomFontFile(file);
      this.settings.fontHeading = 'custom';
      this.settings.customFontHeadingName = res.fontName;
      this.applyTheme();
      this.saveState();
    } catch (err) {
      console.warn(`Failed to upload custom font: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async resetCustomFont() {
    await removeCustomFont();
    this.settings.fontHeading = 'montserrat';
    this.settings.customFontHeadingName = undefined;
    this.settings.wallhavenApiKey = '';
    this.settings.wallhavenCategories = { general: false, anime: true, people: false };
    this.applyTheme();
    this.saveState();
  }

  async loadLiveWallpapers(force = false) {
    if (this.isFetching && !force) return;
    this.isFetching = true;

    const needsInitialWallpaper =
      !this.currentWallpaper ||
      !this.currentWallpaper.url ||
      this.currentWallpaper.id === BRAND_FALLBACK_WALLPAPER.id ||
      !this.isItemSourceEnabled(this.currentWallpaper);

    if (force || needsInitialWallpaper) {
      this.isLoading = true;
    }

    try {
      const items = await fetchWallpapers({
        source: this.settings.wallpaperSource,
        sources: this.settings.enabledSources,
        githubRepos: this.settings.enabledGitHubRepos,
        sort: this.sort,
        time: this.time,
        nsfw: this.nsfw,
        quality: this.settings.imageQuality,
        wallhavenApiKey: this.settings.wallhavenApiKey,
        wallhavenCategories: this.settings.wallhavenCategories,
      });

      let validItems = items.filter((x) => this.isItemSourceEnabled(x) && !!x.url);
      if (validItems.length === 0 && items.length > 0) {
        validItems = items.filter((x) => !!x.url);
      }

      if (validItems.length > 0) {
        if (force || needsInitialWallpaper) {
          this.pinned = false;
          const candidates = validItems.filter((x) => x.id !== this.currentWallpaper.id && !!x.url);
          const fresh = candidates[Math.floor(Math.random() * candidates.length)] || validItems[0]!;
          if (fresh) {
            this.currentWallpaper = fresh;
            this.wallpaperQueue = validItems.filter((x) => x.id !== fresh.id && !!x.url).slice(0, 20);
            const cleanHistory = this.history.filter((x) => !!x.url && x.id !== BRAND_FALLBACK_WALLPAPER.id);
            if (!cleanHistory.some((x) => x.id === fresh.id)) {
              this.history = [fresh, ...cleanHistory].slice(0, 30);
              this.historyIndex = 0;
            } else {
              this.history = cleanHistory;
              this.historyIndex = this.history.findIndex((x) => x.id === fresh.id);
            }
          }
        } else {
          const existingIds = new Set([
            this.currentWallpaper.id,
            ...this.history.map((x) => x.id),
            ...this.wallpaperQueue.map((x) => x.id),
          ]);
          const freshQueueItems = validItems.filter((x) => !existingIds.has(x.id));

          if (freshQueueItems.length > 0) {
            this.wallpaperQueue = [...this.wallpaperQueue, ...freshQueueItems].slice(0, 20);
          } else if (this.wallpaperQueue.length < 4) {
            const recycled = validItems.filter((x) => x.id !== this.currentWallpaper.id);
            this.wallpaperQueue = [...this.wallpaperQueue, ...recycled].slice(0, 20);
          }
        }
        this.saveState();
      }
    } catch (e) {
      console.warn(`Failed to load wallpapers: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      this.isFetching = false;
      if (!this.currentWallpaper.url) {
        this.isLoading = false;
      }
    }
  }

  handleWallpaperError() {
    console.warn('Skipping broken wallpaper:', this.currentWallpaper.url);
    if (this.wallpaperQueue.length > 0) {
      const nextItem = this.wallpaperQueue.shift()!;
      this.currentWallpaper = nextItem;
      this.saveState();
    } else {
      this.currentWallpaper = BRAND_FALLBACK_WALLPAPER;
      this.loadLiveWallpapers(true);
    }
  }

  setAccent(hex: string) {
    this.theme.primary = hex;
    this.applyTheme();
  }

  setBackgroundDim(dim: number) {
    this.theme.backgroundDim = dim;
    this.applyTheme();
  }

  setWallpaperSource(source: WallpaperSource) {
    this.settings.wallpaperSource = source;
    if (source === 'hybrid') {
      this.settings.enabledSources = ['wallhaven', 'konachan', 'cozypixels', 'custom'];
    } else {
      this.settings.enabledSources = [source as IndividualSource];
    }
    this.purgeDisabledSourceItems();
    this.wallpaperQueue = [];
    this.pinned = false;
    this.saveState();
    this.loadLiveWallpapers(true);
  }

  toggleSource(source: IndividualSource) {
    const current = new Set(this.settings.enabledSources);
    if (current.has(source)) {
      if (current.size > 1) {
        current.delete(source);
      }
    } else {
      current.add(source);
    }
    this.settings.enabledSources = Array.from(current);
    if (this.settings.enabledSources.length === 1) {
      this.settings.wallpaperSource = this.settings.enabledSources[0]!;
    } else {
      this.settings.wallpaperSource = 'hybrid';
    }
    this.purgeDisabledSourceItems();
    this.wallpaperQueue = [];
    this.pinned = false;
    this.saveState();
    this.loadLiveWallpapers(true);
  }

  isSourceEnabled(source: IndividualSource): boolean {
    return this.settings.enabledSources.includes(source);
  }

  selectAllSources() {
    this.settings.enabledSources = ['wallhaven', 'konachan', 'cozypixels', 'custom'];
    this.settings.wallpaperSource = 'hybrid';
    this.purgeDisabledSourceItems();
    this.wallpaperQueue = [];
    this.pinned = false;
    this.saveState();
    this.loadLiveWallpapers(true);
  }

  toggleGitHubRepo(id: GitHubRepoId) {
    const current = new Set(this.settings.enabledGitHubRepos);
    if (current.has(id)) {
      if (current.size > 1) {
        current.delete(id);
      }
    } else {
      current.add(id);
    }
    this.settings.enabledGitHubRepos = Array.from(current);
    this.saveState();
    if (this.isSourceEnabled('cozypixels')) {
      this.wallpaperQueue = [];
      this.loadLiveWallpapers(true);
    }
  }

  isGitHubRepoEnabled(id: GitHubRepoId): boolean {
    return this.settings.enabledGitHubRepos.includes(id);
  }

  setWallhavenApiKey(key: string) {
    this.settings.wallhavenApiKey = key.trim();
    this.saveState();
    if (this.isSourceEnabled('wallhaven')) {
      this.wallpaperQueue = [];
      this.loadLiveWallpapers(true);
    }
  }

  toggleWallhavenCategory(cat: 'general' | 'anime' | 'people') {
    const current = this.settings.wallhavenCategories || { general: false, anime: true, people: false };
    const updated = { ...current, [cat]: !current[cat] };
    if (!updated.general && !updated.anime && !updated.people) {
      return;
    }
    this.settings.wallhavenCategories = updated;
    this.saveState();
    if (this.isSourceEnabled('wallhaven')) {
      this.wallpaperQueue = [];
      this.loadLiveWallpapers(true);
    }
  }

  isWallhavenCategoryEnabled(cat: 'general' | 'anime' | 'people'): boolean {
    return !!this.settings.wallhavenCategories?.[cat];
  }

  selectSingleSource(source: IndividualSource) {
    this.settings.enabledSources = [source];
    this.settings.wallpaperSource = source;
    this.purgeDisabledSourceItems();
    this.wallpaperQueue = [];
    this.pinned = false;
    this.saveState();
    this.loadLiveWallpapers(true);
  }

  toggleBottomMenuBtn() {
    this.settings.showBottomMenuBtn = !this.settings.showBottomMenuBtn;
    this.saveState();
  }

  toggleVersionBadge() {
    this.settings.showVersionBadge = !this.settings.showVersionBadge;
    this.saveState();
  }

  setImageQuality(quality: ImageQuality) {
    if (this.settings.imageQuality === quality) return;
    this.settings.imageQuality = quality;
    this.wallpaperQueue = [];
    this.saveState();
    this.loadLiveWallpapers(true);
  }

  async reroll() {
    if (this.incognito || this.pinned) return;

    this.isLoading = true;
    if (this.settings.soundEffects) {
      playRollSound();
    }

    this.isRolling = true;
    if (this.settings.rerollFlash) {
      this.showRollOverlay = true;
      setTimeout(() => {
        this.showRollOverlay = false;
      }, 700);
    }

    this.purgeDisabledSourceItems();

    if (this.wallpaperQueue.length === 0) {
      await this.loadLiveWallpapers(true);
    } else {
      if (this.wallpaperQueue.length <= 3 && !this.isFetching) {
        this.loadLiveWallpapers(false);
      }

      const nextItem = this.wallpaperQueue.shift()!;
      this.currentWallpaper = nextItem;
      if (!this.history.some((x) => x.id === nextItem.id)) {
        this.history = [nextItem, ...this.history].slice(0, 30);
        this.historyIndex = 0;
      } else {
        this.historyIndex = this.history.findIndex((x) => x.id === nextItem.id);
      }
    }

    this.saveState();

    setTimeout(() => {
      this.isRolling = false;
    }, 600);
  }

  togglePin() {
    if (this.incognito) return;
    this.pinned = !this.pinned;
  }

  toggleNsfw() {
    if (this.incognito) return;
    this.nsfw = !this.nsfw;
    this.pinned = false;
    this.wallpaperQueue = [];
    this.isLoading = true;
    this.loadLiveWallpapers(true);
  }

  toggleIncognito() {
    this.incognito = !this.incognito;
    if (this.incognito) {
      this.pinned = false;
    }
  }

  toggleMenu() {
    this.isMenuVisible = !this.isMenuVisible;
    if (this.isMenuVisible) {
      this.isCommandPaletteOpen = false;
    }
  }

  closeMenu() {
    this.isMenuVisible = false;
  }

  toggleCommandPalette() {
    this.isCommandPaletteOpen = !this.isCommandPaletteOpen;
    if (this.isCommandPaletteOpen) {
      this.isMenuVisible = false;
    }
  }

  openCommandPalette() {
    this.isCommandPaletteOpen = true;
    this.isMenuVisible = false;
  }

  closeCommandPalette() {
    this.isCommandPaletteOpen = false;
  }

  setSort(sort: SortFilter) {
    if (this.sort === sort) return;
    this.sort = sort;
    this.pinned = false;
    this.wallpaperQueue = [];
    this.isLoading = true;
    this.loadLiveWallpapers(true);
  }

  setTime(t: TimeFilter) {
    if (this.time === t) return;
    this.time = t;
    this.pinned = false;
    this.wallpaperQueue = [];
    this.isLoading = true;
    this.loadLiveWallpapers(true);
  }

  toggleFavorite(id: string) {
    const item = this.history.find((x) => x.id === id);
    if (item) {
      item.favorite = !item.favorite;
      if (this.currentWallpaper.id === id) {
        this.currentWallpaper.favorite = item.favorite;
      }
    }
  }

  selectFromHistory(id: string) {
    const idx = this.history.findIndex((x) => x.id === id);
    const item = this.history[idx];
    if (idx !== -1 && item) {
      this.isLoading = true;
      this.historyIndex = idx;
      this.currentWallpaper = item;
      this.pinned = true;
    }
  }

  resetSettings() {
    this.theme.primary = '#ffffff';
    this.theme.backgroundDim = 0.32;

    this.settings.clock24h = false;
    this.settings.showSeconds = false;
    this.settings.showTime = true;
    this.settings.showDate = true;
    this.settings.showWallpaperDetails = true;
    this.settings.clockPosition = 'left';
    this.settings.showAttribution = true;
    this.settings.showVersionBadge = true;
    this.settings.menuDockVisibility = 'hover';
    this.settings.soundEffects = true;
    this.settings.rerollFlash = true;
    this.settings.wallpaperSource = 'hybrid';
    this.settings.enabledSources = ['wallhaven', 'konachan', 'cozypixels', 'custom'];
    this.settings.enabledGitHubRepos = ['nordic', 'gruvbox', 'aesthetic', 'cozypixels'];
    this.settings.showBottomMenuBtn = false;
    this.settings.fontHeading = 'montserrat';
    this.settings.fontBody = 'plus-jakarta';
    this.settings.customFontHeadingName = undefined;
    this.settings.wallhavenApiKey = '';
    this.settings.wallhavenCategories = { general: false, anime: true, people: false };

    this.sort = 'hot';
    this.time = 'week';

    this.nsfw = false;
    this.pinned = false;
    this.incognito = false;
    this.showFavoritesOnly = false;

    this.history = [];
    this.currentWallpaper = BRAND_FALLBACK_WALLPAPER;
    this.historyIndex = 0;
    this.wallpaperQueue = [];

    this.applyTheme();
    this.saveState();
    this.loadLiveWallpapers(true);
  }

  removeFromHistory(id: string) {
    const idx = this.history.findIndex((x) => x.id === id);
    if (idx !== -1) {
      if (this.pinned && this.currentWallpaper.id === id) {
        this.pinned = false;
      }
      this.history = this.history.filter((x) => x.id !== id);
      if (this.currentWallpaper.id === id) {
        if (this.history.length > 0) {
          const nextIndex = Math.min(idx, this.history.length - 1);
          this.currentWallpaper = this.history[nextIndex]!;
          this.historyIndex = nextIndex;
        } else if (this.wallpaperQueue.length > 0) {
          const nextQueueItem = this.wallpaperQueue.shift()!;
          this.history = [nextQueueItem];
          this.currentWallpaper = nextQueueItem;
          this.historyIndex = 0;
        } else {
          this.currentWallpaper = BRAND_FALLBACK_WALLPAPER;
          this.history = [];
          this.historyIndex = 0;
          this.loadLiveWallpapers(true);
        }
      } else {
        this.historyIndex = this.history.findIndex((x) => x.id === this.currentWallpaper.id);
        if (this.historyIndex === -1) this.historyIndex = 0;
      }
      this.saveState();
    }
  }

  clearAllHistory() {
    this.pinned = false;
    const favs = this.history.filter((x) => x.favorite);
    this.history = favs;

    if (favs.length > 0) {
      if (!favs.some((x) => x.id === this.currentWallpaper.id)) {
        this.currentWallpaper = favs[0]!;
        this.historyIndex = 0;
      } else {
        this.historyIndex = favs.findIndex((x) => x.id === this.currentWallpaper.id);
      }
    } else {
      if (this.wallpaperQueue.length > 0) {
        const nextQueueItem = this.wallpaperQueue.shift()!;
        this.history = [nextQueueItem];
        this.currentWallpaper = nextQueueItem;
        this.historyIndex = 0;
      } else {
        this.currentWallpaper = BRAND_FALLBACK_WALLPAPER;
        this.history = [];
        this.historyIndex = 0;
        this.loadLiveWallpapers(true);
      }
    }
    this.saveState();
  }
}

export const store = new Store();
