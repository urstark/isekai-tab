<script lang="ts">
  import { store } from '../lib/state.svelte';
  import { PRESET_FONTS } from '../lib/fonts';
  import type { WallpaperSource, SortFilter, TimeFilter } from '../lib/types';
  import MagnifierLinear from '@solar-icons/svelte/linear/magnifier';
  import RestartLinear from '@solar-icons/svelte/linear/restart';
  import PinLinear from '@solar-icons/svelte/linear/pin';
  import FlameLinear from '@solar-icons/svelte/linear/flame';
  import IncognitoLinear from '@solar-icons/svelte/linear/incognito';
  import FolderWithFilesLinear from '@solar-icons/svelte/linear/folder-with-files';
  import HistoryLinear from '@solar-icons/svelte/linear/history';
  import SettingsLinear from '@solar-icons/svelte/linear/settings';
  import KeyboardLinear from '@solar-icons/svelte/linear/keyboard';
  import CloseCircleLinear from '@solar-icons/svelte/linear/close-circle';
  import LetterLinear from '@solar-icons/svelte/linear/letter';
  import Tuning2Linear from '@solar-icons/svelte/linear/tuning-2';
  import ClockCircleLinear from '@solar-icons/svelte/linear/clock-circle';

  interface PaletteCommand {
    id: string;
    title: string;
    category: 'Actions' | 'Source' | 'Typography' | 'Filters' | 'Navigation';
    shortcut?: string;
    action: () => void;
  }

  let searchQuery = $state('');
  let selectedIndex = $state(0);
  let inputElement = $state<HTMLInputElement | null>(null);

  let allCommands = $derived.by<PaletteCommand[]>(() => [
    // Actions
    {
      id: 'reroll',
      title: 'Reroll Wallpaper',
      category: 'Actions',
      shortcut: 'R',
      action: () => store.reroll(),
    },
    {
      id: 'pin',
      title: store.pinned ? 'Unpin Wallpaper' : 'Pin Current Wallpaper',
      category: 'Actions',
      shortcut: 'P',
      action: () => store.togglePin(),
    },
    {
      id: 'nsfw',
      title: store.nsfw ? 'Disable NSFW Filter' : 'Enable NSFW Filter (Anime Girls)',
      category: 'Actions',
      shortcut: 'N',
      action: () => store.toggleNsfw(),
    },
    {
      id: 'incognito',
      title: store.incognito ? 'Turn Off Incognito Mode' : 'Turn On Incognito Privacy Mode',
      category: 'Actions',
      shortcut: 'I',
      action: () => store.toggleIncognito(),
    },

    // Feed Sources
    {
      id: 'src-all',
      title: `Toggle All Sources: ${store.settings.enabledSources.length === 4 ? 'All Active (✓)' : 'Enable All'}`,
      category: 'Source',
      action: () => store.selectAllSources(),
    },
    {
      id: 'src-wallhaven',
      title: `Toggle Wallhaven: ${store.isSourceEnabled('wallhaven') ? 'Active (✓)' : 'Disabled'}`,
      category: 'Source',
      action: () => store.toggleSource('wallhaven'),
    },
    {
      id: 'src-konachan',
      title: `Toggle Konachan (Anime & Waifus): ${store.isSourceEnabled('konachan') ? 'Active (✓)' : 'Disabled'}`,
      category: 'Source',
      action: () => store.toggleSource('konachan'),
    },
    {
      id: 'src-github',
      title: `Toggle GitHub (Linux Ricing & Anime): ${store.isSourceEnabled('cozypixels') ? 'Active (✓)' : 'Disabled'}`,
      category: 'Source',
      action: () => store.toggleSource('cozypixels'),
    },
    {
      id: 'src-gh-nordic',
      title: `Toggle GitHub: Nordic Linux (${store.isGitHubRepoEnabled('nordic') ? 'Active ✓' : 'Disabled'})`,
      category: 'Source',
      action: () => store.toggleGitHubRepo('nordic'),
    },
    {
      id: 'src-gh-gruvbox',
      title: `Toggle GitHub: Gruvbox Ricing (${store.isGitHubRepoEnabled('gruvbox') ? 'Active ✓' : 'Disabled'})`,
      category: 'Source',
      action: () => store.toggleGitHubRepo('gruvbox'),
    },
    {
      id: 'src-gh-aesthetic',
      title: `Toggle GitHub: Aesthetic Anime (${store.isGitHubRepoEnabled('aesthetic') ? 'Active ✓' : 'Disabled'})`,
      category: 'Source',
      action: () => store.toggleGitHubRepo('aesthetic'),
    },
    {
      id: 'src-gh-cozypixels',
      title: `Toggle GitHub: CozyPixels (${store.isGitHubRepoEnabled('cozypixels') ? 'Active ✓' : 'Disabled'})`,
      category: 'Source',
      action: () => store.toggleGitHubRepo('cozypixels'),
    },
    {
      id: 'src-custom',
      title: `Toggle Local Wallpapers: ${store.isSourceEnabled('custom') ? 'Active (✓)' : 'Disabled'}`,
      category: 'Source',
      action: () => store.toggleSource('custom'),
    },

    // Navigation & Hub
    {
      id: 'nav-custom',
      title: 'Open My Custom Wallpapers (Upload Files / Folders)',
      category: 'Navigation',
      action: () => {
        store.activeTab = 'custom';
        store.isMenuVisible = true;
      },
    },
    {
      id: 'nav-history',
      title: 'Open History Gallery',
      category: 'Navigation',
      action: () => {
        store.activeTab = 'history';
        store.isMenuVisible = true;
      },
    },
    {
      id: 'nav-settings',
      title: 'Open Settings & Preferences',
      category: 'Navigation',
      action: () => {
        store.activeTab = 'settings';
        store.isMenuVisible = true;
      },
    },
    {
      id: 'nav-shortcuts',
      title: 'Open Keyboard Shortcuts Guide',
      category: 'Navigation',
      action: () => {
        store.activeTab = 'shortcuts';
        store.isMenuVisible = true;
      },
    },

    // Interface & Preferences
    {
      id: 'pref-footer-version',
      title: `Toggle Footer "Created with ♥" & Version: ${store.settings.showVersionBadge ? 'Visible (✓)' : 'Hidden'}`,
      category: 'Preferences',
      action: () => store.toggleVersionBadge(),
    },
    {
      id: 'pref-attribution',
      title: `Toggle Source Attribution: ${store.settings.showAttribution ? 'Visible (✓)' : 'Hidden'}`,
      category: 'Preferences',
      action: () => {
        store.settings.showAttribution = !store.settings.showAttribution;
        store.saveState();
      },
    },

    // Sort Filters
    {
      id: 'sort-hot',
      title: 'Sort Wallpapers: Hot',
      category: 'Filters',
      action: () => store.setSort('hot'),
    },
    {
      id: 'sort-top',
      title: 'Sort Wallpapers: Top Rated',
      category: 'Filters',
      action: () => store.setSort('top'),
    },
    {
      id: 'sort-new',
      title: 'Sort Wallpapers: Newest First',
      category: 'Filters',
      action: () => store.setSort('new'),
    },
    {
      id: 'sort-relevance',
      title: 'Sort Wallpapers: Relevance',
      category: 'Filters',
      action: () => store.setSort('relevance'),
    },

    // Timeframe
    {
      id: 'time-day',
      title: 'Timeframe: Past 24 Hours',
      category: 'Filters',
      action: () => store.setTime('day'),
    },
    {
      id: 'time-week',
      title: 'Timeframe: Past Week',
      category: 'Filters',
      action: () => store.setTime('week'),
    },
    {
      id: 'time-month',
      title: 'Timeframe: Past Month',
      category: 'Filters',
      action: () => store.setTime('month'),
    },
    {
      id: 'time-all',
      title: 'Timeframe: All Time',
      category: 'Filters',
      action: () => store.setTime('all'),
    },

    // Typography
    ...PRESET_FONTS.map((font) => ({
      id: `font-${font.id}`,
      title: `Font Preset: ${font.name} (${font.category})`,
      category: 'Typography' as const,
      action: () => store.setFontHeading(font.id),
    })),
  ]);

  let filteredCommands = $derived.by(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allCommands;
    return allCommands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q) ||
        (cmd.shortcut && cmd.shortcut.toLowerCase() === q)
    );
  });

  $effect(() => {
    if (store.isCommandPaletteOpen) {
      searchQuery = '';
      selectedIndex = 0;
      setTimeout(() => inputElement?.focus(), 50);
    }
  });

  function executeSelected() {
    const cmd = filteredCommands[selectedIndex];
    if (cmd) {
      cmd.action();
      store.closeCommandPalette();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % Math.max(1, filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      executeSelected();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      store.closeCommandPalette();
    }
  }
</script>

{#if store.isCommandPaletteOpen}
  <!-- Backdrop -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="palette-backdrop"
    onclick={() => store.closeCommandPalette()}
  ></div>

  <!-- Palette Dialog -->
  <div
    class="palette-modal"
    role="dialog"
    aria-modal="true"
    aria-label="Rofi Command Palette"
  >
    <!-- Prompt Bar -->
    <div class="palette-input-wrap">
      <div class="prompt-icon">
        <span class="prompt-symbol">&gt;_</span>
      </div>

      <input
        bind:this={inputElement}
        bind:value={searchQuery}
        type="text"
        class="palette-input"
        placeholder="Type a command or shortcut... (e.g. reroll, wallhaven, montserrat)"
        onkeydown={handleKeydown}
      />

      {#if searchQuery}
        <button
          type="button"
          class="clear-query-btn"
          onclick={() => {
            searchQuery = '';
            inputElement?.focus();
          }}
          aria-label="Clear query"
        >
          <CloseCircleLinear size={16} />
        </button>
      {/if}

      <div class="esc-badge">
        <kbd>ESC</kbd>
      </div>
    </div>

    <!-- Commands List -->
    <div class="palette-results">
      {#if filteredCommands.length === 0}
        <div class="empty-results">
          <p>No matching commands found for "{searchQuery}"</p>
        </div>
      {:else}
        {#each filteredCommands as cmd, idx}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="command-item"
            class:selected={idx === selectedIndex}
            onmouseenter={() => (selectedIndex = idx)}
            onclick={() => {
              selectedIndex = idx;
              executeSelected();
            }}
          >
            <div class="command-icon-wrap">
              {#if cmd.category === 'Actions'}
                <RestartLinear size={16} />
              {:else if cmd.category === 'Source'}
                <FolderWithFilesLinear size={16} />
              {:else if cmd.category === 'Typography'}
                <LetterLinear size={16} />
              {:else if cmd.category === 'Filters'}
                <Tuning2Linear size={16} />
              {:else}
                <SettingsLinear size={16} />
              {/if}
            </div>

            <div class="command-content">
              <span class="command-title">{cmd.title}</span>
              <span class="command-category">{cmd.category}</span>
            </div>

            {#if cmd.shortcut}
              <kbd class="command-key">{cmd.shortcut}</kbd>
            {:else if idx === selectedIndex}
              <kbd class="command-key return-key">↵</kbd>
            {/if}
          </div>
        {/each}
      {/if}
    </div>

    <!-- Footer helper hint -->
    <div class="palette-footer">
      <span><kbd>↑</kbd> <kbd>↓</kbd> to navigate</span>
      <span><kbd>↵</kbd> to execute</span>
      <span><kbd>Esc</kbd> to close</span>
    </div>
  </div>
{/if}

<style>
  .palette-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 90;
    animation: fade-in 0.15s ease forwards;
  }

  .palette-modal {
    position: fixed;
    top: 18%;
    left: 50%;
    transform: translateX(-50%);
    width: min(620px, 92vw);
    max-height: 520px;
    background: var(--glass-surface);
    backdrop-filter: blur(36px) saturate(180%);
    -webkit-backdrop-filter: blur(36px) saturate(180%);
    border: none;
    border-top: var(--glass-border-highlight);
    border-radius: var(--radius-lg);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.85), var(--glass-specular-shadow);
    z-index: 100;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: modal-enter 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes modal-enter {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-14px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0) scale(1);
    }
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .palette-input-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .prompt-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: 14px;
    font-weight: 700;
    color: #ffffff;
    opacity: 0.9;
  }

  .palette-input {
    flex: 1;
    background: transparent;
    border: none;
    color: #ffffff;
    font-family: var(--font-family);
    font-size: 15px;
    font-weight: 500;
    outline: none;
  }

  .palette-input::placeholder {
    color: var(--text-faint);
  }

  .clear-query-btn {
    background: transparent;
    border: none;
    color: var(--text-faint);
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 2px;
    border-radius: 50%;
    transition: color 0.15s ease;
  }

  .clear-query-btn:hover {
    color: #ffffff;
  }

  .esc-badge kbd,
  .palette-footer kbd,
  .command-key {
    font-family: var(--font-mono);
    font-size: 10px;
    background: rgba(255, 255, 255, 0.08);
    border: none;
    border-radius: 4px;
    padding: 2px 6px;
    color: var(--text-muted);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .palette-results {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
    max-height: 380px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .empty-results {
    padding: 32px 20px;
    text-align: center;
    color: var(--text-faint);
    font-size: 13px;
  }

  .command-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 9px 12px;
    border-radius: var(--radius-md);
    cursor: pointer;
    border: none;
    transition: background-color 0.1s ease;
    user-select: none;
  }

  .command-item.selected {
    background: rgba(255, 255, 255, 0.10);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
  }

  .command-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-faint);
    transition: color 0.1s ease;
  }

  .command-item.selected .command-icon-wrap {
    color: #ffffff;
  }

  .command-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .command-title {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.85);
  }

  .command-item.selected .command-title {
    color: #ffffff;
    font-weight: 600;
  }

  .command-category {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-faint);
    background: rgba(255, 255, 255, 0.04);
    border: none;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .command-key.return-key {
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
    border: none;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }

  .palette-footer {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 10px 18px;
    background: rgba(0, 0, 0, 0.25);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    font-size: 11px;
    color: var(--text-faint);
  }
</style>
