<script lang="ts">
  let { size = 20, color = 'rgba(255, 255, 255, 0.85)' } = $props();
</script>

<div class="puff-loader" style="--loader-size: {size}px; --loader-color: {color};" aria-label="Loading">
  <div class="puff-ring ring-1"></div>
  <div class="puff-ring ring-2"></div>
</div>

<style>
  .puff-loader {
    position: relative;
    width: calc(var(--loader-size, 20px) + 16px);
    height: calc(var(--loader-size, 20px) + 16px);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    overflow: visible;
    z-index: 50;
  }

  .puff-ring {
    position: absolute;
    width: var(--loader-size, 20px);
    height: var(--loader-size, 20px);
    border-radius: 50%;
    border: 2px solid var(--loader-color, #ffffff);
    opacity: 0;
    box-sizing: border-box;
    animation: puffRipple 2s cubic-bezier(0.165, 0.84, 0.44, 1) infinite;
  }

  .ring-2 {
    animation-delay: -1s;
  }

  @keyframes puffRipple {
    0% {
      transform: scale(0.2);
      opacity: 0.95;
    }
    70% {
      opacity: 0.35;
    }
    100% {
      transform: scale(1.3);
      opacity: 0;
    }
  }
</style>
