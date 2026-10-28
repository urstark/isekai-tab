<script lang="ts">
  import { store, COLOR_PRESETS } from '../lib/state.svelte';
  import { fly, fade } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import HistoryLinear from '@solar-icons/svelte/linear/history';
  import SettingsLinear from '@solar-icons/svelte/linear/settings';
  import StarLinear from '@solar-icons/svelte/linear/star';
  import StarBold from '@solar-icons/svelte/bold/star';
  import TrashBinMinimalisticLinear from '@solar-icons/svelte/linear/trash-bin-minimalistic';
  import PinLinear from '@solar-icons/svelte/linear/pin';
  import PinBold from '@solar-icons/svelte/bold/pin';
  import PipetteLinear from '@solar-icons/svelte/linear/pipette';
  import CloseCircleLinear from '@solar-icons/svelte/linear/close-circle';
  import VolumeLoudLinear from '@solar-icons/svelte/linear/volume-loud';
  import MagicWandLinear from '@solar-icons/svelte/linear/magic-wand';
  import ClockCircleLinear from '@solar-icons/svelte/linear/clock-circle';
  import RestartLinear from '@solar-icons/svelte/linear/restart';
  import WidgetLinear from '@solar-icons/svelte/linear/widget';
  import KeyboardLinear from '@solar-icons/svelte/linear/keyboard';
  import GalleryLinear from '@solar-icons/svelte/linear/gallery';
  import FolderWithFilesLinear from '@solar-icons/svelte/linear/folder-with-files';
  import UploadTrackLinear from '@solar-icons/svelte/linear/upload-track';
  import LinkLinear from '@solar-icons/svelte/linear/link';
  import TextFormatLinear from '@solar-icons/svelte/linear/text-format';
  import MagnifierLinear from '@solar-icons/svelte/linear/magnifier';
  import { PRESET_FONTS } from '../lib/fonts';
  import { GITHUB_REPOS } from '../lib/types';

  let customUrlInput = $state('');
  let customTitleInput = $state('');

  let filteredHistory = $derived.by(() => {
    if (store.showFavoritesOnly) {
      return store.history.filter((item) => item.favorite);
    }
    return store.history;
  });

  let dragOffsetY = $state(0);
  let isDragging = $state(false);
  let startY = 0;

  function handlePointerDown(e: PointerEvent) {
    if (e.button !== 0) return;
    isDragging = true;
    startY = e.clientY;
    dragOffsetY = 0;

    const target = e.currentTarget as HTMLElement;
    target?.setPointerCapture(e.pointerId);

    const onPointerMove = (ev: PointerEvent) => {
      if (!isDragging) return;
      const delta = ev.clientY - startY;
      dragOffsetY = delta > 0 ? delta : delta * 0.15;
    };

    const onPointerUp = (ev: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      try {
        target?.releasePointerCapture(ev.pointerId);
      } catch {
        // Safe fallback
      }
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      if (dragOffsetY > 90) {
        store.closeMenu();
        setTimeout(() => {
          dragOffsetY = 0;
        }, 320);
      } else {
        dragOffsetY = 0;
      }
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }

  let isResetDone = $state(false);
  let resetTimer: ReturnType<typeof setTimeout> | null = null;

  function handleReset() {
    store.resetSettings();
    isResetDone = true;
    if (resetTimer) clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      isResetDone = false;
    }, 1800);
  }
</script>

{#if store.isMenuVisible}
  <!-- Backdrop click catcher with smooth fade in/out -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="drawer-backdrop"
    onclick={() => store.closeMenu()}
    transition:fade={{ duration: 220 }}
  ></div>

  <!-- Drawer Panel with smooth sliding up and sliding down animation -->
  <div
    class="drawer-panel"
    class:settings-mode={store.activeTab === 'settings' || store.activeTab === 'shortcuts'}
    class:is-dragging={isDragging}
    style:transform="translate(-50%, {dragOffsetY}px)"
    role="dialog"
    aria-modal="true"
    aria-label="Menu drawer"
    transition:fly={{ y: 90, duration: 320, easing: cubicOut }}
  >
    <!-- Drawer Header / Drag Handle -->
    <div class="drawer-topbar">
      <div
        class="drawer-handle-zone"
        class:grabbing={isDragging}
        onpointerdown={handlePointerDown}
        role="button"
        tabindex="0"
        aria-label="Drag down to close drawer"
      >
        <div class="drawer-handle"></div>
      </div>

      <button
        type="button"
        class="close-btn btn-spring"
        onclick={() => store.closeMenu()}
        aria-label="Close menu"
      >
        <CloseCircleLinear size={20} />
      </button>
    </div>

    <div class="drawer-body">
      <!-- Sidebar Tabs -->
      <aside class="drawer-sidebar">
        <button
          type="button"
          class="sidebar-tab pill-spring"
          class:active={store.activeTab === 'history'}
          onclick={() => (store.activeTab = 'history')}
        >
          <HistoryLinear size={18} />
          <span>History</span>
          <span class="count-pill">{store.history.length}</span>
        </button>

        <button
          type="button"
          class="sidebar-tab pill-spring"
          class:active={store.activeTab === 'custom'}
          onclick={() => (store.activeTab = 'custom')}
        >
          <FolderWithFilesLinear size={18} />
          <span>My Wallpapers</span>
          {#if store.customWallpapers.length > 0}
            <span class="count-pill">{store.customWallpapers.length}</span>
          {/if}
        </button>

        <button
          type="button"
          class="sidebar-tab pill-spring"
          class:active={store.activeTab === 'settings'}
          onclick={() => (store.activeTab = 'settings')}
        >
          <SettingsLinear size={18} />
          <span>Settings</span>
        </button>

        <button
          type="button"
          class="sidebar-tab pill-spring"
          class:active={store.activeTab === 'shortcuts'}
          onclick={() => (store.activeTab = 'shortcuts')}
        >
          <KeyboardLinear size={18} />
          <span>Shortcuts</span>
        </button>
      </aside>

      <!-- Content Area -->
      <div class="drawer-content">
        {#if store.activeTab === 'history'}
          <!-- HISTORY PANEL -->
          <div class="tab-panel history-view">
            <div class="history-toolbar">
              <div class="toolbar-title-group">
                <h3>Wallpaper Gallery</h3>
                <p>Browse previously viewed anime wallpapers.</p>
              </div>

              <div class="toolbar-actions">
                <button
                  type="button"
                  class="filter-fav-btn pill-spring"
                  class:active={store.showFavoritesOnly}
                  onclick={() => (store.showFavoritesOnly = !store.showFavoritesOnly)}
                >
                  <StarLinear size={15} />
                  <span>Favorites Only</span>
                </button>

                <button
                  type="button"
                  class="clear-btn pill-spring"
                  disabled={store.history.filter((x) => !x.favorite).length === 0}
                  onclick={() => store.clearAllHistory()}
                  title="Clear non-favorited history"
                >
                  <TrashBinMinimalisticLinear size={15} />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            <!-- Wallpaper Cards Grid -->
            {#if filteredHistory.length === 0}
              <div class="empty-state">
                {#if store.showFavoritesOnly}
                  <StarLinear size={32} />
                  <p>No favorites saved yet. Click the star on any wallpaper to keep it here!</p>
                {:else}
                  <GalleryLinear size={32} />
                  <p>History is empty. Roll a new wallpaper or choose a feed to start!</p>
                {/if}
              </div>
            {:else}
              <div class="cards-grid">
                {#each filteredHistory as item, index (item.id)}
                  {@const isCurrent = store.currentWallpaper.id === item.id}
                  {@const isPinned = store.pinned && isCurrent}
                  <!-- svelte-ignore a11y_click_events_have_key_events -->
                  <!-- svelte-ignore a11y_no_static_element_interactions -->
                  <div
                    class="history-card"
                    class:active={isCurrent}
                    onclick={() => store.selectFromHistory(item.id)}
                  >
                    <div class="card-thumb-wrap">
                      <img
                        src={item.thumbnailUrl || item.url}
                        alt={item.title}
                        class="card-img"
                        loading="lazy"
                      />
                      <div class="card-overlay">
                        <span class="card-num">#{index + 1}</span>
                        {#if isPinned}
                          <span class="pin-badge"><PinBold size={11} /> PINNED</span>
                        {:else if isCurrent}
                          <span class="active-badge">ACTIVE</span>
                        {/if}
                      </div>

                      <!-- Card Quick Actions -->
                      <div class="card-quick-actions" onclick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          class="card-action-btn btn-spring"
                          class:active={item.favorite}
                          onclick={() => store.toggleFavorite(item.id)}
                          aria-label="Favorite"
                        >
                          {#if item.favorite}
                            <StarBold size={14} />
                          {:else}
                            <StarLinear size={14} />
                          {/if}
                        </button>

                        <button
                          type="button"
                          class="card-action-btn btn-spring"
                          class:active={isPinned}
                          onclick={() => {
                            store.selectFromHistory(item.id);
                            store.pinned = true;
                          }}
                          aria-label="Pin wallpaper"
                        >
                          <PinLinear size={14} />
                        </button>

                        <button
                          type="button"
                          class="card-action-btn btn-spring delete-action"
                          onclick={() => store.removeFromHistory(item.id)}
                          aria-label="Remove wallpaper"
                        >
                          <TrashBinMinimalisticLinear size={14} />
                        </button>
                      </div>
                    </div>

                    <div class="card-meta">
                      <h4 class="card-title" title={item.title}>{item.title}</h4>
                      <span class="card-res">{item.res}</span>
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {:else if store.activeTab === 'settings'}
          <!-- SETTINGS PANEL -->
          <div class="tab-panel settings-view">
            <!-- Accent Color Section -->
            <section class="settings-group">
              <div class="group-header">
                <div class="header-left-wrap">
                  <div class="group-icon">
                    <PipetteLinear size={18} />
                  </div>
                  <div class="group-titles">
                    <h4>Accent Color</h4>
                    <p>Choose an accent highlight for buttons and indicators.</p>
                  </div>
                </div>
              </div>

              <div class="color-presets-row">
                {#each COLOR_PRESETS as color}
                  <button
                    type="button"
                    class="color-swatch btn-spring"
                    class:active={store.theme.primary.toLowerCase() === color.toLowerCase()}
                    style="--swatch-color: {color};"
                    onclick={() => store.setAccent(color)}
                    aria-label="Select accent color {color}"
                  ></button>
                {/each}

                <!-- Custom Color Input -->
                <label class="custom-color-btn btn-spring" title="Choose Custom Color">
                  <PipetteLinear size={15} />
                  <input
                    type="color"
                    value={store.theme.primary}
                    oninput={(e) => store.setAccent(e.currentTarget.value)}
                  />
                </label>

                <span class="current-hex">{store.theme.primary.toUpperCase()}</span>
              </div>
            </section>

            <!-- Wallpaper Dim Opacity Section -->
            <section class="settings-group">
              <div class="group-header">
                <div class="header-left-wrap">
                  <div class="group-titles">
                    <h4>Background Dimming</h4>
                    <p>Adjust wallpaper darkness for contrast.</p>
                  </div>
                </div>
                <span class="value-badge">{Math.round(store.theme.backgroundDim * 100)}%</span>
              </div>

              <div class="slider-wrapper">
                <input
                  type="range"
                  min="0.0"
                  max="0.75"
                  step="0.01"
                  value={store.theme.backgroundDim}
                  oninput={(e) => store.setBackgroundDim(parseFloat(e.currentTarget.value))}
                />
              </div>
            </section>

            <!-- Wallpaper Feed Source Section -->
            <section class="settings-group">
              <div class="group-header">
                <div class="header-left-wrap">
                  <div class="group-icon">
                    <GalleryLinear size={18} />
                  </div>
                  <div class="group-titles">
                    <h4>Wallpaper Feed Sources</h4>
                    <p>Select active feeds. You can enable multiple sources together.</p>
                  </div>
                </div>
              </div>

              <div class="source-pills-row">
                <button
                  type="button"
                  class="source-pill btn-spring"
                  class:active={store.settings.enabledSources.length === 4}
                  onclick={() => store.selectAllSources()}
                >
                  All Sources (Hybrid)
                </button>
                <button
                  type="button"
                  class="source-pill btn-spring"
                  class:active={store.isSourceEnabled('wallhaven')}
                  onclick={() => store.toggleSource('wallhaven')}
                >
                  {#if store.isSourceEnabled('wallhaven')}✓ {/if}Wallhaven (Anime)
                </button>
                <button
                  type="button"
                  class="source-pill btn-spring"
                  class:active={store.isSourceEnabled('konachan')}
                  onclick={() => store.toggleSource('konachan')}
                >
                  {#if store.isSourceEnabled('konachan')}✓ {/if}Konachan (Waifus)
                </button>
                <button
                  type="button"
                  class="source-pill btn-spring"
                  class:active={store.isSourceEnabled('cozypixels')}
                  onclick={() => store.toggleSource('cozypixels')}
                >
                  {#if store.isSourceEnabled('cozypixels')}✓ {/if}GitHub Collections
                </button>
                <button
                  type="button"
                  class="source-pill btn-spring"
                  class:active={store.isSourceEnabled('custom')}
                  onclick={() => store.toggleSource('custom')}
                >
                  {#if store.isSourceEnabled('custom')}✓ {/if}Custom (Local & URL)
                </button>
              </div>

              {#if store.isSourceEnabled('cozypixels')}
                <div class="github-subrepos-block">
                  <div class="subrepo-header">
                    <span class="subrepo-title">GitHub Collections</span>
                    <span class="subrepo-desc">Select active repositories</span>
                  </div>
                  <div class="source-pills-row sub-pills-row">
                    {#each GITHUB_REPOS as repo}
                      <button
                        type="button"
                        class="source-pill sub-pill btn-spring"
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
            </section>

            <!-- Typography & Custom Fonts Section -->
            <section class="settings-group">
              <div class="group-header">
                <div class="header-left-wrap">
                  <div class="group-icon">
                    <TextFormatLinear size={18} />
                  </div>
                  <div class="group-titles">
                    <h4>Typography & Custom Fonts</h4>
                    <p>Customize clock digits and UI text with Linux & modern fonts.</p>
                  </div>
                </div>
              </div>

              <!-- Clock & Heading Font Chips -->
              <div class="typography-block">
                <div class="sub-label-row">
                  <span class="sub-label">Clock & Heading Font</span>
                  {#if store.settings.customFontHeadingName}
                    <span class="custom-font-badge">Active: {store.settings.customFontHeadingName}</span>
                  {/if}
                </div>
                <div class="font-chips-grid">
                  {#each PRESET_FONTS as font}
                    <button
                      type="button"
                      class="font-chip btn-spring"
                      class:active={store.settings.fontHeading === font.id}
                      style="font-family: {font.family};"
                      onclick={() => store.setFontHeading(font.id)}
                    >
                      <span class="font-chip-name">{font.name}</span>
                      <span class="font-chip-sample">{font.previewText}</span>
                    </button>
                  {/each}
                </div>
              </div>

              <!-- Interface / Body Font -->
              <div class="typography-block">
                <div class="sub-label-row">
                  <span class="sub-label">Interface & Body Font</span>
                </div>
                <div class="font-chips-grid">
                  {#each PRESET_FONTS.slice(0, 4) as font}
                    <button
                      type="button"
                      class="font-chip btn-spring"
                      class:active={store.settings.fontBody === font.id}
                      style="font-family: {font.family};"
                      onclick={() => store.setFontBody(font.id)}
                    >
                      <span class="font-chip-name">{font.name}</span>
                    </button>
                  {/each}
                </div>
              </div>

              <!-- Custom Font Uploader -->
              <div class="custom-font-uploader">
                <div class="uploader-header-row">
                  <span class="sub-label">Upload Local Font (.ttf, .otf, .woff, .woff2)</span>
                  {#if store.settings.customFontHeadingName}
                    <button
                      type="button"
                      class="reset-font-pill pill-spring"
                      onclick={() => store.resetCustomFont()}
                    >
                      Reset Custom Font
                    </button>
                  {/if}
                </div>
                <label class="font-upload-dropzone pill-spring">
                  <input
                    type="file"
                    accept=".ttf,.otf,.woff,.woff2"
                    class="sr-only"
                    style="display: none;"
                    onchange={(e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) store.uploadCustomFont(file);
                    }}
                  />
                  <UploadTrackLinear size={18} />
                  <span>Choose custom font from your system</span>
                </label>
              </div>
            </section>

            <!-- Clock & Display Customization Section -->
            <section class="settings-group">
              <div class="group-header">
                <div class="header-left-wrap">
                  <div class="group-icon">
                    <ClockCircleLinear size={18} />
                  </div>
                  <div class="group-titles">
                    <h4>Clock & Display</h4>
                  </div>
                </div>
              </div>

              <div class="toggle-list">
                <div class="toggle-row">
                  <span>Clock Alignment</span>
                  <div class="segment-pill">
                    <button
                      type="button"
                      class="segment-btn pill-spring"
                      class:active={store.settings.clockPosition === 'left'}
                      onclick={() => (store.settings.clockPosition = 'left')}
                    >
                      Left
                    </button>
                    <button
                      type="button"
                      class="segment-btn pill-spring"
                      class:active={store.settings.clockPosition === 'center'}
                      onclick={() => (store.settings.clockPosition = 'center')}
                    >
                      Center
                    </button>
                  </div>
                </div>

                <div class="toggle-row">
                  <span>24-Hour Time Format</span>
                  <button
                    type="button"
                    class="toggle-switch pill-spring"
                    class:active={store.settings.clock24h}
                    onclick={() => (store.settings.clock24h = !store.settings.clock24h)}
                  >
                    {store.settings.clock24h ? '24H' : '12H'}
                  </button>
                </div>

                <div class="toggle-row">
                  <span>Show Time</span>
                  <button
                    type="button"
                    class="toggle-switch pill-spring"
                    class:active={store.settings.showTime}
                    onclick={() => (store.settings.showTime = !store.settings.showTime)}
                  >
                    {store.settings.showTime ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div class="toggle-row">
                  <span>Show Seconds</span>
                  <button
                    type="button"
                    class="toggle-switch pill-spring"
                    class:active={store.settings.showSeconds}
                    onclick={() => (store.settings.showSeconds = !store.settings.showSeconds)}
                  >
                    {store.settings.showSeconds ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div class="toggle-row">
                  <span>Show Date</span>
                  <button
                    type="button"
                    class="toggle-switch pill-spring"
                    class:active={store.settings.showDate}
                    onclick={() => (store.settings.showDate = !store.settings.showDate)}
                  >
                    {store.settings.showDate ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div class="toggle-row">
                  <span>Wallpaper Description</span>
                  <button
                    type="button"
                    class="toggle-switch pill-spring"
                    class:active={store.settings.showWallpaperDetails}
                    onclick={() => (store.settings.showWallpaperDetails = !store.settings.showWallpaperDetails)}
                  >
                    {store.settings.showWallpaperDetails ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </section>

            <!-- Interface & Dock Layout Section -->
            <section class="settings-group">
              <div class="group-header">
                <div class="header-left-wrap">
                  <div class="group-icon">
                    <WidgetLinear size={18} />
                  </div>
                  <div class="group-titles">
                    <h4>Interface & Dock</h4>
                  </div>
                </div>
              </div>

              <div class="toggle-list">
                <div class="toggle-row">
                  <span>Bottom Source Attribution</span>
                  <button
                    type="button"
                    class="toggle-switch pill-spring"
                    class:active={store.settings.showAttribution}
                    onclick={() => (store.settings.showAttribution = !store.settings.showAttribution)}
                  >
                    {store.settings.showAttribution ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div class="toggle-row">
                  <span>Bottom "Show Menu" Button</span>
                  <button
                    type="button"
                    class="toggle-switch pill-spring"
                    class:active={store.settings.showBottomMenuBtn}
                    onclick={() => store.toggleBottomMenuBtn()}
                  >
                    {store.settings.showBottomMenuBtn ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div class="toggle-row">
                  <span>Footer "Created with ♥" & Version</span>
                  <button
                    type="button"
                    class="toggle-switch pill-spring"
                    class:active={store.settings.showVersionBadge}
                    onclick={() => store.toggleVersionBadge()}
                  >
                    {store.settings.showVersionBadge ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div class="toggle-row">
                  <span>Quick HUD Layout</span>
                  <div class="segment-pill">
                    <button
                      type="button"
                      class="segment-btn pill-spring"
                      class:active={store.settings.quickHudPosition === 'right'}
                      onclick={() => (store.settings.quickHudPosition = 'right')}
                    >
                      Waybar HUD (Right)
                    </button>
                    <button
                      type="button"
                      class="segment-btn pill-spring"
                      class:active={store.settings.quickHudPosition === 'top'}
                      onclick={() => (store.settings.quickHudPosition = 'top')}
                    >
                      Top Bar (Classic)
                    </button>
                  </div>
                </div>

                <div class="toggle-row">
                  <span>Menu Dock</span>
                  <div class="segment-pill">
                    <button
                      type="button"
                      class="segment-btn pill-spring"
                      class:active={store.settings.menuDockVisibility === 'hover'}
                      onclick={() => (store.settings.menuDockVisibility = 'hover')}
                    >
                      On Hover
                    </button>
                    <button
                      type="button"
                      class="segment-btn pill-spring"
                      class:active={store.settings.menuDockVisibility === 'always'}
                      onclick={() => (store.settings.menuDockVisibility = 'always')}
                    >
                      Always Show
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <!-- FX & Animations Section -->
            <section class="settings-group">
              <div class="group-header">
                <div class="header-left-wrap">
                  <div class="group-icon">
                    <MagicWandLinear size={18} />
                  </div>
                  <div class="group-titles">
                    <h4>Audio & Effects</h4>
                  </div>
                </div>
              </div>

              <div class="toggle-list">
                <div class="toggle-row">
                  <div class="toggle-label-wrap">
                    <VolumeLoudLinear size={16} />
                    <span>Reroll Audio Chime</span>
                  </div>
                  <button
                    type="button"
                    class="toggle-switch pill-spring"
                    class:active={store.settings.soundEffects}
                    onclick={() => (store.settings.soundEffects = !store.settings.soundEffects)}
                  >
                    {store.settings.soundEffects ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div class="toggle-row">
                  <div class="toggle-label-wrap">
                    <MagicWandLinear size={16} />
                    <span>Screen Flash Animation</span>
                  </div>
                  <button
                    type="button"
                    class="toggle-switch pill-spring"
                    class:active={store.settings.rerollFlash}
                    onclick={() => (store.settings.rerollFlash = !store.settings.rerollFlash)}
                  >
                    {store.settings.rerollFlash ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </section>

            <!-- Reset All Settings Section -->
            <section class="settings-group reset-group">
              <div class="group-header">
                <div class="header-left-wrap">
                  <div class="group-icon">
                    <RestartLinear size={18} />
                  </div>
                  <div class="group-titles">
                    <h4>Reset Preferences</h4>
                    <p>Restore all your changes to default.</p>
                  </div>
                </div>
                <button
                  type="button"
                  class="reset-btn pill-spring"
                  class:done={isResetDone}
                  onclick={handleReset}
                >
                  {#if isResetDone}
                    Reset Complete ✓
                  {:else}
                    Reset Defaults
                  {/if}
                </button>
              </div>
            </section>
          </div>
        {:else if store.activeTab === 'shortcuts'}
          <!-- SHORTCUTS PANEL -->
          <div class="tab-panel shortcuts-view">
            <div class="shortcuts-toolbar">
              <div class="toolbar-title-group">
                <h3>Keyboard Shortcuts</h3>
                <p>Quick navigation and interface action keys.</p>
              </div>
              <button
                type="button"
                class="open-rofi-btn pill-spring"
                onclick={() => store.openCommandPalette()}
              >
                <MagnifierLinear size={15} />
                <span>Launch Palette</span>
                <kbd class="btn-kbd">Space</kbd>
              </button>
            </div>

            <!-- Wallpaper Actions -->
            <section class="settings-group">
              <div class="group-header">
                <div class="header-left-wrap">
                  <div class="group-titles">
                    <h4>Wallpaper Controls</h4>
                  </div>
                </div>
              </div>

              <div class="shortcuts-grid">
                <div class="shortcut-item">
                  <span class="shortcut-label">Reroll Wallpaper</span>
                  <kbd class="kbd-badge">R</kbd>
                </div>
                <div class="shortcut-item">
                  <span class="shortcut-label">Pin Current Wallpaper</span>
                  <kbd class="kbd-badge">P</kbd>
                </div>
                <div class="shortcut-item">
                  <span class="shortcut-label">Toggle NSFW Filter</span>
                  <kbd class="kbd-badge">N</kbd>
                </div>
              </div>
            </section>

            <!-- Privacy & Interface -->
            <section class="settings-group">
              <div class="group-header">
                <div class="header-left-wrap">
                  <div class="group-titles">
                    <h4>Interface & Navigation</h4>
                  </div>
                </div>
              </div>

              <div class="shortcuts-grid">
                <div class="shortcut-item">
                  <span class="shortcut-label">Incognito Privacy Mode</span>
                  <kbd class="kbd-badge">I</kbd>
                </div>
                <div class="shortcut-item">
                  <span class="shortcut-label">Command Palette (Rofi / Wofi)</span>
                  <kbd class="kbd-badge">Space / Ctrl+K</kbd>
                </div>
                <div class="shortcut-item">
                  <span class="shortcut-label">Toggle Menu Drawer</span>
                  <kbd class="kbd-badge">M</kbd>
                </div>
                <div class="shortcut-item">
                  <span class="shortcut-label">Close Drawer / Palette</span>
                  <kbd class="kbd-badge">Esc</kbd>
                </div>
              </div>
            </section>
          </div>
        {:else if store.activeTab === 'custom'}
          <!-- CUSTOM WALLPAPERS PANEL -->
          <div class="tab-panel custom-view">
            <div class="history-toolbar">
              <div class="toolbar-title-group">
                <h3>My Custom Wallpapers</h3>
                <p>Add your own local image files, entire folders, or web image URLs.</p>
              </div>
            </div>

            <!-- Upload Controls Card -->
            <div class="custom-inputs-card">
              <div class="upload-buttons-row">
                <label class="upload-action-btn pill-spring">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    class="sr-only"
                    style="display: none;"
                    onchange={(e) => {
                      const files = (e.target as HTMLInputElement).files;
                      if (files && files.length > 0) store.addCustomWallpaperFiles(files);
                    }}
                  />
                  <UploadTrackLinear size={18} />
                  <span>Upload Images</span>
                </label>

                <label class="upload-action-btn pill-spring">
                  <input
                    type="file"
                    webkitdirectory
                    multiple
                    class="sr-only"
                    style="display: none;"
                    onchange={(e) => {
                      const files = (e.target as HTMLInputElement).files;
                      if (files && files.length > 0) store.addCustomWallpaperFiles(files);
                    }}
                  />
                  <FolderWithFilesLinear size={18} />
                  <span>Upload Folder</span>
                </label>
              </div>

              <!-- Add via URL Form -->
              <form
                class="add-url-form"
                onsubmit={(e) => {
                  e.preventDefault();
                  if (customUrlInput.trim()) {
                    store.addCustomWallpaperUrl(customUrlInput, customTitleInput);
                    customUrlInput = '';
                    customTitleInput = '';
                  }
                }}
              >
                <div class="url-input-wrap">
                  <LinkLinear size={16} class="input-icon" />
                  <input
                    type="url"
                    placeholder="Paste direct image URL (https://...)"
                    bind:value={customUrlInput}
                    class="glass-input"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Title (optional)"
                  bind:value={customTitleInput}
                  class="glass-input title-input"
                />
                <button type="submit" class="submit-url-btn pill-spring" disabled={!customUrlInput.trim()}>
                  Add URL
                </button>
              </form>
            </div>

            <!-- Wallpapers Grid or Empty State -->
            {#if store.customWallpapers.length === 0}
              <div class="custom-empty-state">
                <FolderWithFilesLinear size={48} />
                <h4>No custom wallpapers added yet</h4>
                <p>Upload files or folders from your system, or paste web image links above.</p>
              </div>
            {:else}
              <div class="custom-wallpapers-grid">
                {#each store.customWallpapers as item (item.id)}
                  <div class="custom-card" class:active-item={store.currentWallpaper.id === item.id}>
                    <button
                      type="button"
                      class="card-preview-btn"
                      title="Set as active wallpaper"
                      onclick={() => store.selectFromHistory(item.id)}
                    >
                      <img src={item.thumbnailUrl || item.url} alt={item.title} loading="lazy" />
                      <div class="card-overlay">
                        <span class="card-title">{item.title}</span>
                        <span class="card-sub">{item.author}</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      class="card-delete-btn pill-spring"
                      title="Delete wallpaper"
                      onclick={(e) => {
                        e.stopPropagation();
                        store.removeCustomWallpaper(item.id);
                      }}
                    >
                      <TrashBinMinimalisticLinear size={15} />
                    </button>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .drawer-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    z-index: 50;
    cursor: pointer;
  }

  .drawer-panel {
    position: fixed;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    width: min(1140px, 94vw);
    height: min(560px, 64vh);
    background: rgba(14, 14, 16, 0.88);
    backdrop-filter: blur(36px) saturate(160%);
    -webkit-backdrop-filter: blur(36px) saturate(160%);
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: var(--radius-lg);
    box-shadow: 0 32px 80px rgba(0, 0, 0, 0.9);
    z-index: 60;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    cursor: default;
    transition: width 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
    will-change: transform, width;
  }

  .drawer-panel.settings-mode {
    width: min(920px, 94vw);
  }

  .drawer-panel.is-dragging {
    transition: none !important;
    user-select: none;
  }

  .drawer-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 18px 6px;
    position: relative;
    user-select: none;
  }

  .drawer-handle-zone {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 0;
    bottom: 0;
    width: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
    touch-action: none;
    z-index: 10;
  }

  .drawer-handle-zone:active,
  .drawer-handle-zone.grabbing {
    cursor: grabbing;
  }

  .drawer-handle {
    width: 38px;
    height: 4px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.25);
    pointer-events: none;
    transition: background-color 0.15s ease, width 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .drawer-handle-zone:hover .drawer-handle {
    background: rgba(255, 255, 255, 0.55);
    width: 48px;
  }

  .drawer-handle-zone.grabbing .drawer-handle {
    background: #ffffff;
    width: 52px;
  }

  .close-btn {
    margin-left: auto;
    background: transparent;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border-radius: 50%;
    outline: none;
    transition: color 0.15s ease;
  }

  .close-btn:hover {
    color: #ffffff;
  }

  .drawer-body {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .drawer-sidebar {
    width: 210px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 16px 12px;
    background: rgba(0, 0, 0, 0.2);
  }

  .sidebar-tab {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: transparent;
    border: none;
    border-radius: var(--radius-pill);
    color: var(--text-muted);
    font-family: var(--font-family);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    text-align: left;
    outline: none;
    white-space: nowrap;
    transition: background-color 0.15s ease, color 0.15s ease;
  }

  .sidebar-tab span {
    white-space: nowrap;
  }

  .sidebar-tab:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.06);
  }

  .sidebar-tab.active {
    background: rgba(255, 255, 255, 0.14);
    border: none;
    border-top: var(--glass-border-highlight);
    color: #ffffff;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35), var(--glass-specular-shadow);
  }

  .count-pill {
    margin-left: auto;
    font-size: 11px;
    font-family: var(--font-mono);
    background: rgba(255, 255, 255, 0.1);
    padding: 1px 6px;
    border-radius: 999px;
  }

  .drawer-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px;
  }

  .tab-panel {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .history-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
  }

  .toolbar-title-group h3 {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-main);
  }

  .toolbar-title-group p {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 2px;
  }

  .toolbar-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .filter-fav-btn,
  .clear-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    background: rgba(255, 255, 255, 0.08);
    border: none;
    border-radius: var(--radius-pill);
    color: var(--text-muted);
    font-family: var(--font-family);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    transition: background-color 0.15s ease, color 0.15s ease;
  }

  .filter-fav-btn:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.14);
  }

  .filter-fav-btn.active {
    color: #fbbf24;
    background: rgba(251, 191, 36, 0.15);
  }

  .clear-btn:hover:not(:disabled) {
    color: #ff6b6b;
    background: rgba(255, 107, 107, 0.12);
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: 16px;
  }

  .history-card {
    cursor: pointer;
    overflow: hidden;
    padding: 0;
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-md);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
    transition: background-color 0.2s ease, box-shadow 0.2s ease;
  }

  .history-card:hover {
    background: rgba(255, 255, 255, 0.09);
  }

  .history-card.active {
    box-shadow: 0 0 0 2px #ffffff, 0 4px 16px rgba(0, 0, 0, 0.45);
  }

  .card-thumb-wrap {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    background: #000;
  }

  .card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .card-overlay {
    position: absolute;
    top: 8px;
    left: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .card-num {
    font-size: 10px;
    font-family: var(--font-mono);
    font-weight: 600;
    background: rgba(0, 0, 0, 0.65);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .pin-badge,
  .active-badge {
    font-size: 9px;
    font-weight: 700;
    background: #ffffff;
    color: #0a0b0e;
    padding: 2px 6px;
    border-radius: 4px;
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }

  .card-quick-actions {
    position: absolute;
    bottom: 8px;
    right: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  .history-card:hover .card-quick-actions {
    opacity: 1;
  }

  .card-action-btn {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(14, 15, 19, 0.9);
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    transition: background-color 0.12s ease, color 0.12s ease;
  }

  .card-action-btn:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.2);
  }

  .card-action-btn.active {
    color: #fbbf24;
  }

  .card-action-btn.delete-action:hover {
    color: #ff6b6b;
  }

  .card-meta {
    padding: 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .card-title {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--text-main);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-res {
    font-size: 11px;
    color: var(--text-muted);
    font-family: var(--font-mono);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 48px 0;
    color: var(--text-muted);
    text-align: center;
  }

  /* SETTINGS VIEW */
  .settings-view {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    max-width: 100%;
  }

  .settings-group {
    background: rgba(255, 255, 255, 0.02);
    border: none;
    border-top: var(--glass-border-highlight);
    border-radius: var(--radius-md);
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    width: 100%;
    box-sizing: border-box;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25), var(--glass-specular-shadow);
    transition: background-color 0.2s ease, box-shadow 0.2s ease;
  }

  .reset-btn {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 18px;
    background: rgba(255, 255, 255, 0.10);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: none;
    border-top: var(--glass-border-highlight);
    border-radius: var(--radius-pill);
    color: #ffffff;
    font-family: var(--font-family);
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25), var(--glass-specular-shadow);
    outline: none;
    white-space: nowrap;
    transition: background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
  }

  .reset-btn:hover {
    background: rgba(255, 255, 255, 0.18);
    color: #ffffff;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35), var(--glass-specular-shadow);
  }

  .reset-btn.done {
    background: rgba(46, 229, 157, 0.22);
    color: #2ee59d;
    border-color: rgba(46, 229, 157, 0.45);
    border-top-color: rgba(46, 229, 157, 0.65);
    box-shadow: 0 4px 16px rgba(46, 229, 157, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.25);
  }

  .reset-btn:active {
    transform: scale(0.96) !important;
  }

  .group-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    width: 100%;
  }

  .header-left-wrap {
    display: flex;
    align-items: center;
    gap: 12px;
    text-align: left;
  }

  .group-titles {
    display: flex;
    flex-direction: column;
    text-align: left;
  }

  .group-titles h4 {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-main);
    text-align: left;
    margin: 0;
  }

  .group-titles p {
    font-size: 12px;
    color: var(--text-muted);
    margin: 0;
    margin-top: 2px;
    text-align: left;
  }

  .group-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    background: transparent;
    border: none;
    padding: 0;
  }

  .color-presets-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .color-swatch {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: var(--swatch-color);
    border: none;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    position: relative;
    outline: none;
    transition: box-shadow 0.15s ease;
  }

  .color-swatch.active {
    box-shadow: 0 0 0 2px #ffffff, 0 0 14px var(--swatch-color), 0 2px 10px rgba(0, 0, 0, 0.7);
  }

  .custom-color-btn {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: transparent;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: color 0.15s ease, transform 0.15s ease;
  }

  .custom-color-btn:hover {
    color: #ffffff;
    transform: scale(1.1);
  }

  .custom-color-btn input[type='color'] {
    position: absolute;
    opacity: 0;
    inset: 0;
    cursor: pointer;
  }

  .current-hex {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-muted);
    margin-left: 6px;
  }

  .value-badge {
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 700;
    color: #ffffff;
    background: rgba(255, 255, 255, 0.1);
    padding: 3px 10px;
    border-radius: var(--radius-pill);
  }

  .slider-wrapper {
    padding: 4px 0;
  }

  .toggle-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    color: var(--text-main);
  }

  .toggle-label-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-muted);
  }

  .toggle-switch {
    background: rgba(255, 255, 255, 0.08);
    border: none;
    color: var(--text-muted);
    padding: 5px 14px;
    border-radius: var(--radius-pill);
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    outline: none;
    transition: all 0.15s ease;
  }

  .toggle-switch:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #ffffff;
  }

  .toggle-switch.active {
    background: #ffffff;
    color: #0a0b0e;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  }

  .segment-pill {
    display: inline-flex;
    background: rgba(255, 255, 255, 0.06);
    border: none;
    border-radius: var(--radius-pill);
    padding: 3px;
    gap: 3px;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.35);
  }

  .segment-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    padding: 4px 12px;
    border-radius: var(--radius-pill);
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    outline: none;
    transition: all 0.15s ease;
  }

  .segment-btn:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.08);
  }

  .segment-btn.active {
    background: #ffffff;
    color: #0a0b0e;
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35), inset 0 1px 0 #ffffff;
  }

  /* Wallpaper Source Pills */
  .source-pills-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 4px;
  }

  .source-pill {
    padding: 7px 14px;
    background: rgba(255, 255, 255, 0.05);
    border: none;
    border-top: var(--glass-border-highlight);
    border-radius: var(--radius-pill);
    color: var(--text-muted);
    font-family: var(--font-family);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    outline: none;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25), var(--glass-specular-shadow);
    transition: all 0.15s ease;
  }

  .source-pill:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.10);
  }

  .source-pill.active {
    background: #ffffff;
    color: #0a0b0e;
    border: none;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35), inset 0 1px 0 #ffffff;
  }

  .github-subrepos-block {
    margin-top: 12px;
    padding: 14px 18px;
    background: rgba(0, 0, 0, 0.22);
    border: none;
    border-top: var(--glass-border-highlight);
    border-radius: var(--radius-md);
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.35), var(--glass-specular-shadow);
  }

  .subrepo-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .subrepo-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted);
  }

  .subrepo-desc {
    font-size: 11px;
    color: var(--text-muted);
    opacity: 0.75;
  }

  .source-pill.sub-pill {
    padding: 7px 14px;
    font-size: 11.5px;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.05);
    border: none;
    border-top: var(--glass-border-highlight);
    border-radius: var(--radius-pill);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25), var(--glass-specular-shadow);
    transition: all 0.15s ease;
  }

  .source-pill.sub-pill:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #ffffff;
  }

  .source-pill.sub-pill.active {
    background: #ffffff;
    color: #0a0b0e;
    font-weight: 600;
    border: none;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35), inset 0 1px 0 #ffffff;
  }

  /* Keyboard Shortcuts Grid */
  .shortcuts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    column-gap: 28px;
    row-gap: 10px;
  }

  .shortcut-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    font-size: 13px;
    background: transparent !important;
    border: none !important;
    border-radius: 0 !important;
  }

  .shortcut-label {
    color: var(--text-muted);
  }

  .kbd-badge {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 700;
    color: #ffffff;
    background: rgba(255, 255, 255, 0.08);
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.18);
    padding: 2px 8px;
    border-radius: 4px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.12);
  }

  .shortcuts-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    margin-bottom: 16px;
  }

  .open-rofi-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    background: rgba(255, 255, 255, 0.08);
    border: none;
    border-radius: var(--radius-pill);
    color: var(--text-muted);
    font-family: var(--font-family);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    transition: background-color 0.15s ease, color 0.15s ease;
  }

  .open-rofi-btn:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.14);
  }

  .btn-kbd {
    background: rgba(255, 255, 255, 0.10);
    color: var(--text-muted);
    font-family: var(--font-mono);
    font-size: 10px;
    padding: 1px 6px;
    border-radius: 4px;
    font-weight: 600;
    transition: color 0.15s ease, background-color 0.15s ease;
  }

  .open-rofi-btn:hover .btn-kbd {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.18);
  }

  /* Typography Section */
  .typography-block {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 14px;
  }

  .sub-label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .sub-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-muted);
  }

  .custom-font-badge {
    font-family: var(--font-mono);
    font-size: 11px;
    padding: 2px 8px;
    background: rgba(var(--accent-rgb), 0.14);
    border: none;
    border-radius: var(--radius-pill);
    color: var(--accent);
    box-shadow: inset 0 1px 0 rgba(var(--accent-rgb), 0.2);
  }

  .font-chips-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 8px;
  }

  .font-chip {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.04);
    border: none;
    border-top: var(--glass-border-highlight);
    border-radius: var(--radius-md);
    color: var(--text-muted);
    cursor: pointer;
    text-align: left;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25), var(--glass-specular-shadow);
    transition: all 0.15s ease;
  }

  .font-chip:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
  }

  .font-chip.active {
    background: #ffffff;
    color: #0a0b0e;
    border: none;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35), inset 0 1px 0 #ffffff;
  }

  .font-chip-name {
    font-size: 13px;
    font-weight: 600;
    line-height: 1.2;
  }

  .font-chip-sample {
    font-size: 11px;
    opacity: 0.7;
    margin-top: 2px;
  }

  .custom-font-uploader {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 6px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .uploader-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .reset-font-pill {
    padding: 3px 10px;
    background: rgba(255, 80, 80, 0.18);
    border: none;
    border-radius: var(--radius-pill);
    color: #ff8080;
    font-size: 11px;
    cursor: pointer;
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 120, 120, 0.3);
    transition: all 0.15s ease;
  }

  .reset-font-pill:hover {
    background: rgba(255, 80, 80, 0.28);
    color: #ffffff;
  }

  .font-upload-dropzone {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 18px;
    background: var(--glass-surface);
    border: none;
    border-top: var(--glass-border-highlight);
    border-radius: var(--radius-pill);
    color: var(--text-main);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), var(--glass-specular-shadow);
    transition: background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
  }

  .font-upload-dropzone span {
    white-space: nowrap;
  }

  .font-upload-dropzone:hover {
    background: rgba(255, 255, 255, 0.12);
    color: #ffffff;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35), var(--glass-specular-shadow);
  }

  /* Custom Wallpapers Tab */
  .custom-view {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .custom-inputs-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background: var(--glass-surface);
    border: none;
    border-top: var(--glass-border-highlight);
    border-radius: var(--radius-lg);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35), var(--glass-specular-shadow);
  }

  .upload-buttons-row {
    display: flex;
    gap: 10px;
  }

  .upload-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 18px;
    background: rgba(255, 255, 255, 0.08);
    border: none;
    border-top: var(--glass-border-highlight);
    border-radius: var(--radius-pill);
    color: #ffffff;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), var(--glass-specular-shadow);
    transition: background-color 0.15s ease, box-shadow 0.15s ease;
  }

  .upload-action-btn span {
    white-space: nowrap;
  }

  .upload-action-btn:hover {
    background: rgba(255, 255, 255, 0.14);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35), var(--glass-specular-shadow);
  }

  .add-url-form {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .url-input-wrap {
    flex: 2;
    position: relative;
    display: flex;
    align-items: center;
  }

  :global(.input-icon) {
    position: absolute;
    left: 12px;
    color: var(--text-faint);
    pointer-events: none;
  }

  .glass-input {
    width: 100%;
    padding: 8px 14px 8px 36px;
    background: rgba(0, 0, 0, 0.35);
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--radius-pill);
    color: #ffffff;
    font-family: var(--font-family);
    font-size: 13px;
    outline: none;
    box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.04);
    transition: box-shadow 0.15s ease;
  }

  .glass-input.title-input {
    flex: 1;
    padding-left: 14px;
  }

  .glass-input:focus {
    box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.18), 0 0 12px rgba(255, 255, 255, 0.08);
  }

  .submit-url-btn {
    padding: 8px 18px;
    background: #ffffff;
    color: #0a0b0e;
    border: none;
    border-radius: var(--radius-pill);
    font-family: var(--font-family);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.15s ease;
  }

  .submit-url-btn:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  .custom-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 40px 20px;
    text-align: center;
    color: var(--text-faint);
  }

  .custom-empty-state h4 {
    margin: 0;
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.8);
  }

  .custom-empty-state p {
    margin: 0;
    font-size: 0.9rem;
  }

  .custom-wallpapers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 14px;
    max-height: 280px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .custom-card {
    position: relative;
    border-radius: var(--radius-md);
    overflow: hidden;
    background: rgba(0, 0, 0, 0.4);
    border: none;
    border-top: var(--glass-border-highlight);
    aspect-ratio: 16 / 10;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35), var(--glass-specular-shadow);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .custom-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), var(--glass-specular-shadow);
  }

  .custom-card.active-item {
    border-top: 1px solid var(--accent);
    box-shadow: 0 0 20px rgba(var(--accent-rgb), 0.35), 0 8px 24px rgba(0, 0, 0, 0.5);
  }

  .card-preview-btn {
    width: 100%;
    height: 100%;
    padding: 0;
    background: transparent;
    border: none;
    cursor: pointer;
    position: relative;
    display: block;
  }

  .card-preview-btn img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .card-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.8) 0%, transparent 60%);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 8px 10px;
    text-align: left;
  }

  .card-title {
    font-size: 12px;
    font-weight: 600;
    color: #ffffff;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-sub {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.6);
  }

  .card-delete-btn {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    color: rgba(255, 120, 120, 0.9);
    cursor: pointer;
    opacity: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    transition: opacity 0.15s ease, background-color 0.15s ease, color 0.15s ease;
    z-index: 5;
  }

  .custom-card:hover .card-delete-btn {
    opacity: 1;
  }

  .card-delete-btn:hover {
    background: rgba(255, 60, 60, 0.9);
    color: #ffffff;
  }
</style>
