import type { PresetFont } from './types';
import { getCustomFont, saveCustomFont, deleteCustomFont } from './db';

export const PRESET_FONTS: PresetFont[] = [
  {
    id: 'montserrat',
    name: 'Montserrat',
    family: "'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif",
    category: 'sans',
    previewText: '12:00 AM',
  },
  {
    id: 'plus-jakarta',
    name: 'Plus Jakarta Sans',
    family: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    category: 'sans',
    previewText: 'Modern Solstice',
  },
  {
    id: 'jetbrains-mono',
    name: 'JetBrains Mono',
    family: "'JetBrains Mono', monospace",
    category: 'mono',
    previewText: '0xLINUX',
  },
  {
    id: 'poppins',
    name: 'Poppins',
    family: "'Poppins', sans-serif",
    category: 'sans',
    previewText: 'Clean Geometry',
  },
  {
    id: 'space-grotesk',
    name: 'Space Grotesk',
    family: "'Space Grotesk', sans-serif",
    category: 'display',
    previewText: 'Cyberpunk Vibe',
  },
  {
    id: 'inter',
    name: 'Inter',
    family: "'Inter', -apple-system, sans-serif",
    category: 'sans',
    previewText: 'Pixel Perfect',
  },
  {
    id: 'outfit',
    name: 'Outfit',
    family: "'Outfit', sans-serif",
    category: 'sans',
    previewText: 'Refined Minimal',
  },
  {
    id: 'fira-code',
    name: 'Fira Code',
    family: "'Fira Code', monospace",
    category: 'mono',
    previewText: '=> fn() {}',
  },
];

export async function loadAndApplyCustomFont(): Promise<string | null> {
  if (typeof document === 'undefined' || typeof FontFace === 'undefined') return null;
  const stored = await getCustomFont('active_custom_font');
  if (!stored) return null;

  try {
    const fontFace = new FontFace(stored.name, stored.data);
    await fontFace.load();
    document.fonts.add(fontFace);
    return stored.name;
  } catch (err) {
    console.warn('Failed to load custom font:', err);
    return null;
  }
}

export async function registerCustomFontFile(file: File): Promise<{ fontName: string; fontFamily: string }> {
  const buffer = await file.arrayBuffer();
  const cleanName = file.name
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  const fontName = `UserFont_${cleanName}`;

  if (typeof document !== 'undefined' && typeof FontFace !== 'undefined') {
    const fontFace = new FontFace(fontName, buffer);
    await fontFace.load();
    document.fonts.add(fontFace);
  }

  await saveCustomFont({
    id: 'active_custom_font',
    name: fontName,
    data: buffer,
    fileName: file.name,
    createdAt: Date.now(),
  });

  return {
    fontName: file.name,
    fontFamily: `'${fontName}', sans-serif`,
  };
}

export async function removeCustomFont(): Promise<void> {
  await deleteCustomFont('active_custom_font');
}
