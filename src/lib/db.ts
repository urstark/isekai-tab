import type { WallpaperItem } from './types';

const DB_NAME = 'isekai_tab_db';
const DB_VERSION = 1;
const WALLPAPERS_STORE = 'custom_wallpapers';
const FONTS_STORE = 'custom_fonts';

export interface StoredCustomWallpaper {
  id: string;
  title: string;
  author: string;
  res: string;
  blob?: Blob;
  directUrl?: string;
  thumbnailDataUrl?: string;
  createdAt: number;
}

export interface StoredCustomFont {
  id: string;
  name: string;
  data: ArrayBuffer;
  fileName: string;
  createdAt: number;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB not supported'));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(WALLPAPERS_STORE)) {
          db.createObjectStore(WALLPAPERS_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(FONTS_STORE)) {
          db.createObjectStore(FONTS_STORE, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
}

export async function saveCustomWallpaper(record: StoredCustomWallpaper): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(WALLPAPERS_STORE, 'readwrite');
    const store = tx.objectStore(WALLPAPERS_STORE);
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getAllCustomWallpapers(): Promise<StoredCustomWallpaper[]> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(WALLPAPERS_STORE, 'readonly');
      const store = tx.objectStore(WALLPAPERS_STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to load custom wallpapers from IndexedDB:', err);
    return [];
  }
}

export async function deleteCustomWallpaper(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(WALLPAPERS_STORE, 'readwrite');
    const store = tx.objectStore(WALLPAPERS_STORE);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function saveCustomFont(font: StoredCustomFont): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FONTS_STORE, 'readwrite');
    const store = tx.objectStore(FONTS_STORE);
    const req = store.put(font);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getCustomFont(id: string): Promise<StoredCustomFont | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(FONTS_STORE, 'readonly');
      const store = tx.objectStore(FONTS_STORE);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function deleteCustomFont(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FONTS_STORE, 'readwrite');
    const store = tx.objectStore(FONTS_STORE);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export function convertStoredToWallpaperItem(stored: StoredCustomWallpaper): WallpaperItem {
  let displayUrl = stored.directUrl || '';
  if (stored.blob) {
    displayUrl = URL.createObjectURL(stored.blob);
  }

  return {
    id: stored.id,
    title: stored.title,
    author: stored.author || 'Local / Custom',
    res: stored.res || 'Custom Image',
    url: displayUrl,
    thumbnailUrl: stored.thumbnailDataUrl || displayUrl,
    sourceUrl: stored.directUrl || '#',
    sourceName: 'Custom Wallpaper',
    favorite: false,
  };
}
