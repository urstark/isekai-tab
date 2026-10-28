<script lang="ts">
  let title = $state('Isekai Tab');
</script>

<main class="page">
  <div class="content">
    <h1 class="logo">{title}</h1>
    <p class="subtitle">Ready to build step-by-step</p>
  </div>
</main>

<style>
  .page {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(ellipse at 50% 40%, #171b26 0%, #0a0c12 100%);
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    text-align: center;
  }

  .logo {
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    background: linear-gradient(135deg, #ffffff 0%, #94a3b8 100%);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .subtitle {
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 400;
    letter-spacing: 0.02em;
  }
</style>
