<script lang="ts">
  import { store } from '../lib/state.svelte';
  import { GITHUB_REPOS, type SortFilter, type TimeFilter, type WallpaperSource } from '../lib/types';
  import RestartLinear from '@solar-icons/svelte/linear/restart';
  import PinLinear from '@solar-icons/svelte/linear/pin';
  import PinBold from '@solar-icons/svelte/bold/pin';
  import FlameLinear from '@solar-icons/svelte/linear/flame';
  import IncognitoLinear from '@solar-icons/svelte/linear/incognito';
  import Tuning2Linear from '@solar-icons/svelte/linear/tuning-2';
  import MagnifierLinear from '@solar-icons/svelte/linear/magnifier';
  import FolderWithFilesLinear from '@solar-icons/svelte/linear/folder-with-files';
  import AltArrowRightLinear from '@solar-icons/svelte/linear/alt-arrow-right';

  let isHudHovered = $state(false);
  let isFlyoutOpen = $state(false);

  let shouldRevealHud = $derived.by(() => {
    return isHudHovered || isFlyoutOpen || store.isRolling || store.isMenuVisible;
  });

  const sortOptions: SortFilter[] = ['relevance', 'hot', 'top', 'new'];
  const timeOptions: TimeFilter[] = ['hour', 'day', 'week', 'month', 'year', 'all'];
  const sourceOptions: { id: WallpaperSource; label: string }[] = [
    { id: 'hybrid', label: 'Hybrid' },
    { id: 'wallhaven', label: 'Wallhaven' },
    { id: 'konachan', label: 'Konachan' },
    { id: 'cozypixels', label: 'GitHub' },
    { id: 'custom', label: 'Local' },
  ];
</script>

<!-- Proximity zone hugging the right edge of the screen -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<aside
  class="waybar-proximity-zone"
  onmouseenter={() => (isHudHovered = true)}
  onmouseleave={() => (isHudHovered = false)}
  aria-label="Floating Waybar Quick HUD"
>
  <div class="waybar-hud-wrap" class:peeking={!shouldRevealHud}>
    <!-- Flyout Filters Drawer (slides out right-to-left) -->
    {#if isFlyoutOpen && !store.incognito}
      <div class="waybar-flyout glass-surface" role="region" aria-label="Filters and sources flyout">
        <div class="flyout-header">
          <span class="flyout-title">Feed Controls</span>
          <button
            type="button"
            class="flyout-close-btn"
            onclick={() => (isFlyoutOpen = false)}
            aria-label="Close filters drawer"
          >
            <AltArrowRightLinear size={14} />
          </button>
        </div>

        <!-- Feed Sources (Multi-Select) -->
        <div class="flyout-group">
          <div class="flyout-label-row">
            <span class="flyout-label">Sources</span>
            <span class="flyout-subhint">Multi-select</span>
          </div>
          <div class="flyout-pills-row">
            <button
              type="button"
              class="flyout-pill pill-spring"
              class:active={store.settings.enabledSources.length === 4}
              onclick={() => store.selectAllSources()}
            >
              All
            </button>
            <button
              type="button"
              class="flyout-pill pill-spring"
              class:active={store.isSourceEnabled('wallhaven')}
              onclick={() => store.toggleSource('wallhaven')}
            >
              {#if store.isSourceEnabled('wallhaven')}✓ {/if}Wallhaven
            </button>
            <button
              type="button"
              class="flyout-pill pill-spring"
              class:active={store.isSourceEnabled('konachan')}
              onclick={() => store.toggleSource('konachan')}
            >
              {#if store.isSourceEnabled('konachan')}✓ {/if}Konachan
            </button>
            <button
              type="button"
              class="flyout-pill pill-spring"
              class:active={store.isSourceEnabled('cozypixels')}
              onclick={() => store.toggleSource('cozypixels')}
            >
              {#if store.isSourceEnabled('cozypixels')}✓ {/if}GitHub
            </button>
            <button
              type="button"
              class="flyout-pill pill-spring"
              class:active={store.isSourceEnabled('custom')}
              onclick={() => store.toggleSource('custom')}
            >
              {#if store.isSourceEnabled('custom')}✓ {/if}Local
            </button>
          </div>
        </div>

        <!-- GitHub Sub-Collections (Nordic, Gruvbox, Aesthetic, CozyPixels) -->
        {#if store.isSourceEnabled('cozypixels')}
          <div class="flyout-group github-subgroup">
            <div class="flyout-label-row">
              <span class="flyout-label">GitHub Collections</span>
              <span class="flyout-subhint">Linux & Anime</span>
            </div>
            <div class="flyout-pills-row">
              {#each GITHUB_REPOS as repo}
                <button
                  type="button"
                  class="flyout-pill subpill pill-spring"
                  class:active={store.isGitHubRepoEnabled(repo.id)}
                  onclick={() => store.toggleGitHubRepo(repo.id)}
                  title={repo.desc}
                >
                  {#if store.isGitHubRepoEnabled(repo.id)}✓ {/if}{repo.label}
                </button>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Sort Options -->
        <div class="flyout-group">
          <span class="flyout-label">Sort</span>
          <div class="flyout-pills-row">
            {#each sortOptions as s}
              <button
                type="button"
                class="flyout-pill pill-spring"
                class:active={store.sort === s}
                onclick={() => store.setSort(s)}
              >
                {s}
              </button>
            {/each}
          </div>
        </div>

        <!-- Time Options (when not 'new') -->
        {#if store.sort !== 'new'}
          <div class="flyout-group">
            <span class="flyout-label">Timeframe</span>
            <div class="flyout-pills-row">
              {#each timeOptions as t}
                <button
                  type="button"
                  class="flyout-pill pill-spring"
                  class:active={store.time === t}
                  onclick={() => store.setTime(t)}
                >
                  {t}
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Unified Single Waybar Rail Capsule -->
    <div class="waybar-rail glass-capsule">
      <!-- Reroll Button -->
      <button
        type="button"
        class="hud-btn pill-spring"
        class:active={store.isRolling}
        disabled={store.pinned || store.incognito}
        onclick={() => store.reroll()}
        aria-label="Reroll wallpaper"
      >
        <span class="spin-wrap" class:spinning={store.isRolling}>
          <RestartLinear size={16} />
        </span>
        <span class="hud-tooltip">Reroll <kbd>R</kbd></span>
      </button>

      <!-- Pin Button -->
      <button
        type="button"
        class="hud-btn pill-spring"
        class:active={store.pinned}
        disabled={store.incognito}
        onclick={() => store.togglePin()}
        aria-label="Pin wallpaper"
      >
        {#if store.pinned}
          <PinBold size={16} />
        {:else}
          <PinLinear size={16} />
        {/if}
        <span class="hud-tooltip">{store.pinned ? 'Unpin' : 'Pin'} <kbd>P</kbd></span>
      </button>

      <!-- NSFW Toggle -->
      <button
        type="button"
        class="hud-btn pill-spring"
        class:active={store.nsfw}
        disabled={store.incognito}
        onclick={() => store.toggleNsfw()}
        aria-label="Toggle NSFW filter"
      >
        <FlameLinear size={16} />
        <span class="hud-tooltip">NSFW <kbd>N</kbd></span>
      </button>

      <!-- Incognito Button -->
      <button
        type="button"
        class="hud-btn pill-spring"
        class:active={store.incognito}
        onclick={() => store.toggleIncognito()}
        aria-label="Toggle incognito mode"
      >
        <IncognitoLinear size={16} />
        <span class="hud-tooltip">Incognito <kbd>I</kbd></span>
      </button>

      <!-- Subtle separator within the single capsule -->
      <div class="hud-divider"></div>

      <!-- Command Palette Launcher -->
      <button
        type="button"
        class="hud-btn pill-spring"
        onclick={() => store.openCommandPalette()}
        aria-label="Open Command Palette"
      >
        <MagnifierLinear size={16} />
        <span class="hud-tooltip">Rofi / Command <kbd>Space</kbd></span>
      </button>

      <!-- Feed Filters Flyout Trigger -->
      {#if !store.incognito}
        <button
          type="button"
          class="hud-btn pill-spring"
          class:active={isFlyoutOpen}
          onclick={() => (isFlyoutOpen = !isFlyoutOpen)}
          aria-label="Toggle feed filters drawer"
        >
          {#if isFlyoutOpen}
            <AltArrowRightLinear size={16} />
          {:else}
            <Tuning2Linear size={16} />
          {/if}
          <span class="hud-tooltip">Feed Filters</span>
        </button>
      {/if}

      <!-- Open Drawer / Custom Wallpapers -->
      <button
        type="button"
        class="hud-btn pill-spring"
        class:active={store.isMenuVisible}
        onclick={() => store.toggleMenu()}
        aria-label="Open Wallpaper Hub"
      >
        <FolderWithFilesLinear size={16} />
        <span class="hud-tooltip">Hub <kbd>M</kbd></span>
      </button>
    </div>
  </div>
</aside>

<style>
  .waybar-proximity-zone {
    position: fixed;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    z-index: 45;
    padding: 30px 20px 30px 48px;
    pointer-events: auto;
    transition: opacity 0.3s ease;
  }

  .waybar-hud-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
    transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.28s ease;
    will-change: transform, opacity;
  }

  .waybar-hud-wrap.peeking {
    opacity: 0.18;
    transform: translateX(18px);
  }

  .waybar-hud-wrap:hover,
  .waybar-hud-wrap:focus-within {
    opacity: 1;
    transform: translateX(0);
  }

  .glass-capsule {
    background: var(--glass-surface);
    backdrop-filter: blur(28px) saturate(180%);
    -webkit-backdrop-filter: blur(28px) saturate(180%);
    border: none;
    border-top: var(--glass-border-highlight);
    border-radius: var(--radius-pill);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8), var(--glass-specular-shadow);
  }

  .glass-surface {
    background: var(--glass-surface);
    backdrop-filter: blur(36px) saturate(180%);
    -webkit-backdrop-filter: blur(36px) saturate(180%);
    border: none;
    border-top: var(--glass-border-highlight);
    border-radius: var(--radius-lg);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.85), var(--glass-specular-shadow);
  }

  .waybar-rail {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 8px 6px;
  }

  .hud-divider {
    width: 20px;
    height: 1px;
    background: rgba(255, 255, 255, 0.12);
    margin: 2px 0;
  }

  .hud-btn {
    position: relative;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    border-radius: 50%;
    color: var(--text-muted);
    cursor: pointer;
    outline: none;
    transition: color 0.15s ease, background-color 0.15s ease;
  }

  .hud-btn:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.08);
  }

  .hud-btn.active {
    background: #ffffff;
    color: #0a0b0e;
    box-shadow: 0 0 14px rgba(255, 255, 255, 0.35);
  }

  .hud-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    pointer-events: none;
  }

  .spin-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .spin-wrap.spinning {
    animation: hud-spin 0.7s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }

  @keyframes hud-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* Tooltip */
  .hud-tooltip {
    position: absolute;
    right: calc(100% + 12px);
    top: 50%;
    transform: translateY(-50%) translateX(6px);
    background: rgba(12, 14, 18, 0.94);
    backdrop-filter: blur(16px);
    border: none;
    border-top: var(--glass-border-highlight);
    border-radius: var(--radius-sm);
    padding: 5px 9px;
    color: #ffffff;
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s ease, transform 0.15s ease;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7), var(--glass-specular-shadow);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .hud-tooltip kbd {
    font-family: var(--font-mono);
    font-size: 10px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    padding: 1px 4px;
    border-radius: 4px;
  }

  .hud-btn:hover .hud-tooltip {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }

  /* Flyout Drawer */
  .waybar-flyout {
    width: 260px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    animation: flyout-slide 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes flyout-slide {
    from {
      opacity: 0;
      transform: translateX(12px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .flyout-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 6px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .flyout-title {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted);
  }

  .flyout-close-btn {
    background: transparent;
    border: none;
    color: var(--text-faint);
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 2px;
    border-radius: 4px;
    transition: color 0.15s ease;
  }

  .flyout-close-btn:hover {
    color: #ffffff;
  }

  .flyout-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .flyout-label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .flyout-subhint {
    font-size: 10px;
    font-weight: 500;
    color: var(--text-faint);
  }

  .flyout-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-faint);
  }

  .flyout-pills-row {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .flyout-pill {
    padding: 4px 10px;
    background: rgba(255, 255, 255, 0.06);
    border: none;
    border-radius: var(--radius-pill);
    color: var(--text-muted);
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
    transition: all 0.15s ease;
  }

  .flyout-pill:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.12);
  }

  .flyout-pill.active {
    background: #ffffff;
    color: #0a0b0e;
    border: none;
    font-weight: 600;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4), inset 0 1px 0 #ffffff;
  }

  .github-subgroup {
    padding: 8px 10px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: var(--radius-sm);
    border: 1px solid rgba(255, 255, 255, 0.05);
    animation: fadeIn 0.2s ease-out;
  }

  .flyout-pill.subpill {
    font-size: 10px;
    padding: 3px 8px;
    background: rgba(255, 255, 255, 0.05);
  }

  .flyout-pill.subpill.active {
    background: var(--accent);
    color: var(--accent-contrast);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
