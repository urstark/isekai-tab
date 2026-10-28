<script lang="ts">
  import { store } from '../lib/state.svelte';
  import type { SortFilter, TimeFilter } from '../lib/types';
  import FlameLinear from '@solar-icons/svelte/linear/flame';
  import PinLinear from '@solar-icons/svelte/linear/pin';
  import PinBold from '@solar-icons/svelte/bold/pin';
  import RestartLinear from '@solar-icons/svelte/linear/restart';
  import IncognitoLinear from '@solar-icons/svelte/linear/incognito';

  const sortOptions: SortFilter[] = ['relevance', 'hot', 'top', 'new'];
  const timeOptions: TimeFilter[] = ['hour', 'day', 'week', 'month', 'year', 'all'];
</script>

<div class="nav-container">
  <!-- Minimalist Filter Links (fluid pixel-by-pixel collapse) -->
  <div class="filter-group" class:collapsed={store.incognito}>
    <div class="filter-row">
      {#each sortOptions as s, idx}
        {#if idx > 0}<span class="dot">•</span>{/if}
        <button
          type="button"
          class="filter-link"
          class:selected={store.sort === s}
          onclick={() => store.setSort(s)}
        >
          {s}
        </button>
      {/each}
    </div>

    {#if store.sort !== 'new'}
      <div class="filter-row">
        {#each timeOptions as t, idx}
          {#if idx > 0}<span class="dot">•</span>{/if}
          <button
            type="button"
            class="filter-link"
            class:selected={store.time === t}
            onclick={() => store.setTime(t)}
          >
            {t}
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Action Buttons Arranged in 2 Rows -->
  <div class="actions-wrapper">
    <!-- Row 1: Wallpaper Actions (smoothly collapses vertically in incognito) -->
    <div class="btn-row row-primary" class:collapsed={store.incognito}>
      <!-- NSFW Button -->
      <button
        type="button"
        class="nav-btn pill-spring"
        class:active={store.nsfw}
        disabled={store.incognito}
        tabindex={store.incognito ? -1 : 0}
        onclick={() => store.toggleNsfw()}
        title="Toggle NSFW"
      >
        <span>nsfw</span>
        <FlameLinear size={15} />
      </button>

      <!-- PIN Button -->
      <button
        type="button"
        class="nav-btn pill-spring"
        class:active={store.pinned}
        disabled={store.incognito}
        tabindex={store.incognito ? -1 : 0}
        onclick={() => store.togglePin()}
        title="Pin wallpaper"
      >
        <span>pin</span>
        {#if store.pinned}
          <PinBold size={15} />
        {:else}
          <PinLinear size={15} />
        {/if}
      </button>

      <!-- REROLL Button -->
      <button
        type="button"
        class="nav-btn pill-spring"
        class:active={store.isRolling}
        disabled={store.pinned || store.incognito}
        tabindex={store.incognito ? -1 : 0}
        onclick={() => store.reroll()}
        title="Reroll wallpaper"
      >
        <span>reroll</span>
        <span class="spin-wrap" class:spinning={store.isRolling}>
          <RestartLinear size={15} />
        </span>
      </button>
    </div>

    <!-- Row 2: Privacy Controls -->
    <div class="btn-row row-secondary">
      <!-- INCOGNITO Button -->
      <button
        type="button"
        class="nav-btn pill-spring"
        class:active={store.incognito}
        onclick={() => store.toggleIncognito()}
        title="Incognito mode"
      >
        <span>incognito</span>
        <IncognitoLinear size={15} />
      </button>
    </div>
  </div>
</div>

<style>
  .nav-container {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
    margin-top: 6px;
    user-select: none;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 5px;
    padding: 0;
    max-height: 80px;
    opacity: 1;
    transform: translateY(0);
    overflow: hidden;
    transition: max-height 0.45s cubic-bezier(0.16, 1, 0.3, 1),
                opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.45s cubic-bezier(0.16, 1, 0.3, 1),
                margin 0.45s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: max-height, opacity, transform;
  }

  .filter-group.collapsed {
    max-height: 0;
    opacity: 0;
    transform: translateY(-8px);
    margin: 0;
    pointer-events: none;
  }

  .filter-row {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85rem;
  }

  .filter-link {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.55);
    font-family: var(--font-family);
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    padding: 1px 3px;
    outline: none;
    text-shadow: 0 1px 2px #000000, 0 2px 8px rgba(0, 0, 0, 0.95);
    transition: color 0.12s ease, text-shadow 0.12s ease;
  }

  .filter-link:hover {
    color: #ffffff;
    text-shadow: 0 1px 2px #000000, 0 0 10px rgba(255, 255, 255, 0.6), 0 2px 8px rgba(0, 0, 0, 0.95);
  }

  .filter-link.selected {
    color: #ffffff;
    font-weight: 700;
    text-shadow: 0 1px 2px #000000, 0 0 14px rgba(255, 255, 255, 0.8), 0 2px 8px rgba(0, 0, 0, 0.95);
  }

  .dot {
    color: rgba(255, 255, 255, 0.55);
    font-size: 0.75rem;
    text-shadow: 0 1px 2px #000000, 0 2px 8px rgba(0, 0, 0, 0.95);
  }

  .actions-wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
    margin-top: 8px;
    transition: all 0.45s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .btn-row {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    transition: max-height 0.45s cubic-bezier(0.16, 1, 0.3, 1),
                opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.45s cubic-bezier(0.16, 1, 0.3, 1),
                margin 0.45s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: max-height, opacity, transform;
  }

  .row-primary {
    max-height: 48px;
    opacity: 1;
    transform: translateY(0);
    overflow: hidden;
  }

  .row-primary.collapsed {
    max-height: 0;
    opacity: 0;
    transform: translateY(-8px);
    margin: 0;
    pointer-events: none;
  }

  .nav-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
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
    white-space: nowrap;
    transform: translateZ(0);
    transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
  }

  .nav-btn:hover {
    cursor: pointer;
  }

  .nav-btn.active {
    background: var(--glass-btn-active-bg);
    color: var(--glass-btn-active-color);
    border: 1px solid var(--glass-btn-active-border);
    border-top: 1px solid var(--glass-btn-active-border-top);
    border-bottom: 1px solid var(--glass-btn-active-border-bottom);
    font-weight: 600;
    text-shadow: none;
    box-shadow: var(--glass-btn-active-shadow);
  }

  .nav-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
    pointer-events: none;
  }

  .spin-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.3, 1);
  }

  .spin-wrap.spinning {
    transform: rotate(360deg);
  }
</style>
