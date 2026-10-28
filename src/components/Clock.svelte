<script lang="ts">
  import { store } from '../lib/state.svelte';

  let now = $state(new Date());

  $effect(() => {
    const intervalMs = store.settings.showSeconds ? 1000 : 10000;
    const timer = setInterval(() => {
      now = new Date();
    }, intervalMs);
    return () => clearInterval(timer);
  });

  let timeString = $derived.by(() => {
    return now.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      second: store.settings.showSeconds ? '2-digit' : undefined,
      hour12: !store.settings.clock24h,
    });
  });

  let dateString = $derived.by(() => {
    return now.toLocaleDateString([], {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }).toUpperCase();
  });
</script>

<div class="clock-block" class:center-mode={store.settings.clockPosition === 'center'}>
  {#if store.settings.showTime}
    <h1 class="time-text">{timeString}</h1>
  {/if}

  {#if store.settings.showDate}
    <h2 class="date-text">{dateString}</h2>
  {/if}

  <div
    class="details-text"
    class:collapsed={store.incognito || store.isLoading || !store.settings.showWallpaperDetails}
  >
    <p class="title-line" title={store.currentWallpaper.title}>
      {#if store.currentWallpaper.sourceUrl}
        <a
          href={store.currentWallpaper.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          class="title-link"
        >
          {store.currentWallpaper.title}
        </a>
      {:else}
        {store.currentWallpaper.title}
      {/if}
    </p>
    <p class="meta-line">
      <span>{store.currentWallpaper.res}</span>
      {#if store.currentWallpaper.author}
        <span class="sep">•</span>
        <span>{store.currentWallpaper.author}</span>
      {/if}
    </p>
  </div>
</div>

<style>
  .clock-block {
    display: flex;
    flex-direction: column;
    user-select: none;
    max-width: 600px;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .clock-block.center-mode {
    align-items: center;
    text-align: center;
    max-width: 100%;
  }

  .time-text {
    font-family: var(--font-heading);
    font-size: clamp(3.2rem, 5.5vw, 4.8rem);
    font-weight: 700;
    line-height: 1.04;
    color: #ffffff;
    text-shadow: 0.05em 0.05em 0.15em rgba(0, 0, 0, 0.85);
    margin: 0;
    margin-bottom: 8px;
    letter-spacing: -0.02em;
  }

  .center-mode .time-text {
    font-size: clamp(4rem, 7vw, 6.5rem);
    margin-bottom: 12px;
  }

  .date-text {
    font-family: var(--font-heading);
    font-size: clamp(1rem, 1.4vw, 1.35rem);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    letter-spacing: 0.04em;
    text-shadow: 0.06em 0.06em 0.15em rgba(0, 0, 0, 0.85);
    margin: 0;
    margin-bottom: 24px;
  }

  .center-mode .date-text {
    font-size: clamp(1.1rem, 1.6vw, 1.5rem);
    margin-bottom: 20px;
  }

  .details-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 80px;
    opacity: 1;
    transform: translateY(0);
    overflow: hidden;
    transition: max-height 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: max-height, opacity, transform;
  }

  .center-mode .details-text {
    align-items: center;
  }

  .details-text.collapsed {
    max-height: 0;
    opacity: 0;
    transform: translateY(-8px);
    pointer-events: none;
  }

  .title-line {
    font-size: 1rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.85);
    margin: 0;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .title-link {
    color: inherit;
    text-decoration: none;
    transition: color 0.15s ease, text-decoration 0.15s ease;
  }

  .title-link:hover {
    color: #ffffff;
    text-decoration: underline;
  }

  .center-mode .title-line {
    font-size: 1.1rem;
  }

  .meta-line {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .center-mode .meta-line {
    justify-content: center;
  }

  .sep {
    opacity: 0.5;
  }
</style>
