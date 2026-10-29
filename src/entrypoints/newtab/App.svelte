<script lang="ts">
  import { onMount } from 'svelte';
  import { store } from '../../lib/state.svelte';
  import Wallpaper from '../../components/Wallpaper.svelte';
  import Clock from '../../components/Clock.svelte';
  import Navigation from '../../components/Navigation.svelte';
  import WaybarHud from '../../components/WaybarHud.svelte';
  import CommandPalette from '../../components/CommandPalette.svelte';
  import Footer from '../../components/Footer.svelte';
  import Drawer from '../../components/Drawer.svelte';

  onMount(() => {
    store.applyTheme();

    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyK') {
        e.preventDefault();
        store.toggleCommandPalette();
        return;
      }

      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.repeat ||
        e.ctrlKey ||
        e.altKey ||
        e.metaKey
      ) {
        return;
      }

      if (store.isCommandPaletteOpen) {
        if (e.code === 'Escape') {
          e.preventDefault();
          store.closeCommandPalette();
        }
        return;
      }

      switch (e.code) {
        case 'Space':
          if (!store.isMenuVisible) {
            e.preventDefault();
            store.openCommandPalette();
          }
          break;
        case 'KeyR':
          e.preventDefault();
          store.reroll();
          break;
        case 'KeyP':
          e.preventDefault();
          store.togglePin();
          break;
        case 'KeyN':
          e.preventDefault();
          store.toggleNsfw();
          break;
        case 'KeyI':
          e.preventDefault();
          store.toggleIncognito();
          break;
        case 'KeyM':
          e.preventDefault();
          store.toggleMenu();
          break;
        case 'Escape':
          if (store.isMenuVisible) {
            e.preventDefault();
            store.closeMenu();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

<main class="page-container">

  <Wallpaper />

  <div class="ambient-vignette-top" class:hidden={store.isDefaultScreen}></div>
  <div class="ambient-vignette-bottom" class:hidden={store.isDefaultScreen}></div>

  <div class="app-frame">

    <header class="app-header">
      <div class="header-left">
        {#if store.settings.clockPosition === 'left'}
          <Clock />
        {/if}
      </div>

      <div class="header-right">
        {#if store.settings.quickHudPosition === 'top'}
          <Navigation />
        {/if}
      </div>
    </header>

    {#if store.settings.clockPosition === 'center'}
      <div
        class="hero-clock-center"
        class:incognito-mode={store.incognito}
      >
        <Clock />
      </div>
    {/if}

    <div class="footer-wrap">
      <Footer />
    </div>
  </div>

  {#if store.settings.quickHudPosition === 'right'}
    <WaybarHud />
  {/if}

  <CommandPalette />

  <Drawer />
</main>

<style>
  .page-container {
    width: 100vw;
    height: 100vh;
    position: relative;
    overflow: hidden;
    background: var(--bg-primary);
  }

  /* Soft Vignette Shields for Header and Footer Legibility */
  .ambient-vignette-top {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 320px;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.22) 45%, rgba(0, 0, 0, 0.05) 75%, transparent 100%);
    pointer-events: none;
    z-index: 5;
    opacity: 1;
    transition: opacity 0.5s ease;
  }

  .ambient-vignette-bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 180px;
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.14) 45%, transparent 100%);
    pointer-events: none;
    z-index: 5;
    opacity: 1;
    transition: opacity 0.5s ease;
  }

  .ambient-vignette-top.hidden,
  .ambient-vignette-bottom.hidden {
    opacity: 0;
  }

  .app-frame {
    position: relative;
    z-index: 10;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: clamp(38px, 4.8vh, 52px) clamp(36px, 3.8vw, 56px);
    transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .app-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;
    gap: 32px;
    position: relative;
    z-index: 20;
  }

  .header-left {
    flex: 1;
    min-width: 0;
    transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .header-right {
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
    transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .footer-wrap {
    width: 100%;
    transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .hero-clock-center {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 15;
    pointer-events: auto;
    display: flex;
    justify-content: center;
    width: 100%;
    max-width: 800px;
    padding: 0 20px;
    box-sizing: border-box;
    transition: top 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .hero-clock-center.incognito-mode {
    top: 26%;
  }

  @media (max-width: 900px) {
    .app-header {
      flex-direction: column;
      gap: 20px;
    }

    .header-right {
      width: 100%;
      justify-content: flex-start;
    }
  }
</style>
