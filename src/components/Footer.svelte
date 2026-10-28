<script lang="ts">
  import { store } from '../lib/state.svelte';
  import AltArrowUpLinear from '@solar-icons/svelte/linear/alt-arrow-up';
  import AltArrowDownLinear from '@solar-icons/svelte/linear/alt-arrow-down';
  import HeartLinear from '@solar-icons/svelte/linear/heart';
  import Loader from './Loader.svelte';

  let isDockHovered = $state(false);
  let shouldShowDock = $derived.by(() => {
    return (
      store.settings.menuDockVisibility === 'always' ||
      isDockHovered ||
      store.isMenuVisible
    );
  });
</script>

<footer class="footer-bar" aria-label="Footer and navigation">

  <div class="attr-side" class:collapsed={store.incognito || !store.settings.showAttribution}>
    {#if !store.incognito}

      <div class="loader-wrap" class:visible={store.isLoading}>
        <Loader size={20} color="rgba(255, 255, 255, 0.85)" />
      </div>

      <div class="attr-text" class:visible={!store.isLoading && store.settings.showAttribution && !!store.currentWallpaper.url}>
        <p class="attr-title">
          Image from
          <a
            href={store.currentWallpaper.sourceUrl || 'https://wallhaven.cc'}
            target="_blank"
            rel="noopener noreferrer"
          >
            {store.currentWallpaper.subreddit || 'Wallhaven'}
          </a>
        </p>
      </div>
    {/if}
  </div>

  {#if store.settings.showBottomMenuBtn}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="dock-proximity-zone"
      onmouseenter={() => (isDockHovered = true)}
      onmouseleave={() => (isDockHovered = false)}
    >
      <div class="center-dock" class:collapsed={store.incognito || !shouldShowDock}>
        <button
          type="button"
          class="menu-btn pill-spring"
          class:active={store.isMenuVisible}
          tabindex={store.incognito || !shouldShowDock ? -1 : 0}
          onclick={() => store.toggleMenu()}
          title="Toggle Drawer"
        >
          <span>{store.isMenuVisible ? 'Hide Menu' : 'Show Menu'}</span>
          {#if store.isMenuVisible}
            <AltArrowDownLinear size={15} />
          {:else}
            <AltArrowUpLinear size={15} />
          {/if}
        </button>
      </div>
    </div>
  {/if}

  <div class="project-side" class:hidden={store.incognito || !store.settings.showVersionBadge}>
    <p class="project-text">
      <span>Created with</span>
      <HeartLinear size={13} class="heart-icon" />
      <a
        href="https://github.com/urstark/isekai-tab"
        target="_blank"
        rel="noopener noreferrer"
        class="version-link"
      >
        v0.1.0
      </a>
    </p>
  </div>
</footer>

<style>
  .footer-bar {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    width: 100%;
    user-select: none;
    position: relative;
    z-index: 30;
    min-height: 42px;
  }

  .attr-side {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    font-size: 0.95rem;
    text-shadow: 0 1px 6px rgba(0, 0, 0, 0.9);
    min-width: 240px;
    min-height: 38px;
    opacity: 1;
    transform: translateY(0);
    overflow: visible;
    position: relative;
    z-index: 30;
    transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: opacity, transform;
  }

  .attr-side.collapsed {
    opacity: 0;
    transform: translateY(8px);
    pointer-events: none;
  }

  .loader-wrap {
    display: flex;
    align-items: center;
    max-height: 0;
    opacity: 0;
    overflow: visible;
    z-index: 50;
    position: relative;
    transform: scale(0.85);
    transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                max-height 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: opacity, transform;
  }

  .loader-wrap.visible {
    opacity: 1;
    max-height: 42px;
    transform: scale(1);
    overflow: visible;
  }

  .attr-text {
    display: flex;
    flex-direction: column;
    gap: 3px;
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    transform: translateY(4px);
    transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1),
                max-height 0.45s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .attr-text.visible {
    opacity: 1;
    max-height: 48px;
    transform: translateY(0);
  }

  .attr-title {
    color: rgba(255, 255, 255, 0.85);
    margin: 0;
  }

  .attr-title a {
    color: #ffffff;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.12s ease;
  }

  .attr-title a:hover {
    color: var(--accent);
  }

  .dock-proximity-zone {
    position: absolute;
    left: 50%;
    bottom: -24px;
    transform: translateX(-50%);
    width: 360px;
    height: 96px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-bottom: 24px;
    z-index: 25;
    pointer-events: auto;
  }

  .center-dock {
    opacity: 1;
    transform: translateY(0) scale(1);
    transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: opacity, transform;
  }

  .center-dock.collapsed {
    opacity: 0;
    transform: translateY(10px) scale(0.92);
    pointer-events: none;
  }

  .menu-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 20px;
    background: var(--glass-btn-bg);
    backdrop-filter: var(--glass-btn-blur);
    -webkit-backdrop-filter: var(--glass-btn-blur);
    border: 1px solid var(--glass-btn-border);
    border-top: 1px solid var(--glass-btn-border-top);
    border-bottom: 1px solid var(--glass-btn-border-bottom);
    border-radius: var(--radius-pill);
    color: var(--glass-btn-color);
    font-family: var(--font-family);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    outline: none;
    box-shadow: var(--glass-btn-shadow);
    text-shadow: var(--glass-btn-text-shadow);
    transform: translateZ(0);
    transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
  }

  .menu-btn:hover {
    cursor: pointer;
  }

  .menu-btn.active {
    background: var(--glass-btn-active-bg);
    color: var(--glass-btn-active-color);
    border: 1px solid var(--glass-btn-active-border);
    border-top: 1px solid var(--glass-btn-active-border-top);
    border-bottom: 1px solid var(--glass-btn-active-border-bottom);
    font-weight: 600;
    text-shadow: none;
    box-shadow: var(--glass-btn-active-shadow);
  }

  .project-side {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.7);
    text-shadow: 0 1px 6px rgba(0, 0, 0, 0.9);
    transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .project-side.hidden {
    opacity: 0;
    pointer-events: none;
    transform: translateY(6px);
  }

  .project-text {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .version-link {
    font-family: var(--font-mono);
    font-size: 11px;
    color: rgba(255, 255, 255, 0.75);
    text-decoration: underline;
    text-underline-offset: 3px;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.15s ease, opacity 0.15s ease;
  }

  :global(.heart-icon) {
    color: #ff6b6b;
  }

  .version-link:hover {
    color: #ffffff;
    opacity: 1;
  }
</style>
