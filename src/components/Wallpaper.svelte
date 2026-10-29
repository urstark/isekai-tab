<script lang="ts">
  import { store } from '../lib/state.svelte';
  import RestartLinear from '@solar-icons/svelte/linear/restart';
  import DefaultCanvas from './DefaultCanvas.svelte';

  let imgLoaded = $state(false);

  $effect(() => {
    const _url = store.currentWallpaper.url;
    imgLoaded = false;
    if (_url) {
      store.setLoading(true);
    } else {
      store.setLoading(false);
    }
  });
</script>

<div class="wallpaper-view" class:incognito-active={store.incognito || !store.currentWallpaper.url}>

  <DefaultCanvas active={store.isDefaultScreen || !imgLoaded} />

  {#if store.currentWallpaper.url}
    <img
      src={store.currentWallpaper.url}
      alt={store.currentWallpaper.title}
      class="wallpaper-media"
      decoding="async"
      fetchpriority="high"
      class:visible={imgLoaded && !store.incognito}
      onload={() => {
        imgLoaded = true;
        store.setLoading(false);
      }}
      onerror={() => {
        imgLoaded = false;
        store.handleWallpaperError();
      }}
    />
  {/if}

  <div class="dim-overlay" class:hidden={store.isDefaultScreen || !imgLoaded}></div>

  {#if store.showRollOverlay && !store.incognito}
    <div class="flash-burst">
      <div class="flash-icon">
        <RestartLinear size={48} />
      </div>
    </div>
  {/if}
</div>

<style>
  .wallpaper-view {
    position: absolute;
    inset: 0;
    overflow: hidden;
    z-index: 0;
    background-color: #16171b;
  }

  .wallpaper-media {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    opacity: 0;
    filter: blur(14px);
    transform: scale(1.03);
    z-index: 2;
    transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.75s cubic-bezier(0.16, 1, 0.3, 1),
                filter 0.65s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: opacity, transform, filter;
  }

  .wallpaper-media.visible {
    opacity: 1;
    filter: blur(0px);
    transform: scale(1);
  }

  .dim-overlay {
    position: absolute;
    inset: 0;
    background-color: #000000;
    opacity: var(--wallpaper-dim, 0.35);
    transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: none;
    z-index: 3;
  }

  .dim-overlay.hidden {
    opacity: 0;
  }

  .flash-burst {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle, rgba(var(--accent-rgb), 0.22) 0%, rgba(0, 0, 0, 0.6) 80%);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 40;
    animation: flashFade 0.7s cubic-bezier(0.1, 0.8, 0.2, 1) forwards;
  }

  .flash-icon {
    color: var(--accent);
    filter: drop-shadow(0 0 20px var(--accent));
    animation: spinPulse 0.65s cubic-bezier(0.2, 0.8, 0.3, 1) forwards;
  }

  @keyframes flashFade {
    0% {
      opacity: 0.9;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes spinPulse {
    0% {
      transform: scale(0.6) rotate(0deg);
      opacity: 0.4;
    }
    50% {
      transform: scale(1.2) rotate(180deg);
      opacity: 1;
    }
    100% {
      transform: scale(1) rotate(360deg);
      opacity: 0.8;
    }
  }
</style>
