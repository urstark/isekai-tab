<script lang="ts">
  import { store } from '../lib/state.svelte';

  let { active }: { active?: boolean } = $props();
  const isActive = $derived(active !== undefined ? active : store.isDefaultScreen);
</script>

<div class="default-canvas" class:active={isActive}>
  <div
    class="center-brand"
    class:center-clock={store.settings.clockPosition === 'center'}
  >
    <img src="/icon.svg" alt="Isekai Tab" class="brand-logo" />
  </div>
</div>

<style>
  .default-canvas {
    position: absolute;
    inset: 0;
    background-color: #16171b;
    opacity: 0;
    pointer-events: none;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: opacity;
  }

  .default-canvas.active {
    opacity: 1;
  }

  .center-brand {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.92);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    transition: top 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .default-canvas.active .center-brand {
    transform: translate(-50%, -50%) scale(1);
  }

  .center-brand.center-clock {
    top: 58%;
  }

  .brand-logo {
    width: 120px;
    height: 120px;
    border: none;
    background: transparent;
    border-radius: 0;
    box-shadow: none;
    filter: none;
    opacity: 0.85;
    user-select: none;
    pointer-events: none;
  }
</style>

