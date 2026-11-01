<div align="center">
  <img src="public/icon/128.png" width="96" height="96" alt="Isekai Tab icon" />

  # Isekai Tab

  <p align="center">
    <b>Your new tab. Your own world.</b><br />
    <em>A beautiful, deeply customizable new-tab experience inspired by anime aesthetics and Linux desktop ricing.</em>
  </p>

  <p align="center">
    Discover stunning wallpapers, fine-tune your workspace, and make every new tab feel like yours — with keyboard-first controls and privacy at its core.
  </p>

  <p align="center">
    <a href="#showcase"><b>Showcase</b></a> ·
    <a href="#features"><b>Features</b></a> ·
    <a href="#installation"><b>Installation</b></a> ·
    <a href="#keyboard-shortcuts"><b>Shortcuts</b></a> ·
    <a href="#development"><b>Development</b></a>
  </p>

  <p align="center">
    <a href="https://addons.mozilla.org/firefox/addon/isekai-tab/"><img src="https://img.shields.io/amo/v/isekai-tab?style=for-the-badge&color=e58e26&labelColor=16171b&logo=firefox-browser&logoColor=white&label=Firefox%20Add-ons" alt="Firefox Add-ons" /></a>
    <a href="https://github.com/urstark/isekai-tab/releases"><img src="https://img.shields.io/github/v/release/urstark/isekai-tab?style=for-the-badge&color=e58e26&labelColor=16171b&logo=github" alt="Latest release" /></a>
    <a href="https://github.com/urstark/isekai-tab/stargazers"><img src="https://img.shields.io/github/stars/urstark/isekai-tab?style=for-the-badge&color=e58e26&labelColor=16171b" alt="GitHub stars" /></a>
    <a href="LICENSE"><img src="https://img.shields.io/github/license/urstark/isekai-tab?style=for-the-badge&color=e58e26&labelColor=16171b" alt="License" /></a>
  </p>

  <br />

  <img src=".github/assets/home.png" width="90%" alt="Isekai Tab new-tab workspace" />
  <br />
  <sub><em>An anime-inspired workspace, shaped by you.</em></sub>
</div>

<br />

---

## Showcase

<div align="center" id="showcase">
  <table>
    <tr>
      <td align="center" width="50%">
        <img src=".github/assets/search.png" width="100%" alt="Keyboard command palette" />
        <br />
        <sub><b>Command Palette</b> — Navigate without leaving the keyboard</sub>
      </td>
      <td align="center" width="50%">
        <img src=".github/assets/menu.png" width="100%" alt="Customization and wallpaper feed settings" />
        <br />
        <sub><b>Customization</b> — Make every detail yours</sub>
      </td>
    </tr>
    <tr>
      <td align="center" colspan="2">
        <img src=".github/assets/incognito.png" width="85%" alt="Minimal dark canvas" />
        <br />
        <sub><b>Minimal Canvas</b> — A quieter view in one keystroke</sub>
      </td>
    </tr>
  </table>
</div>

---

## Features

<div id="features"></div>

### Wallpapers worth opening a new tab for

Discover artwork from **Wallhaven**, **Konachan**, **Yande.re**, and curated **GitHub** wallpaper collections. Browse anime, atmospheric landscapes, and desktop ricing aesthetics, or blend sources together with **Hybrid Mode**.

* **Curated collections:** Explore themes such as Nordic Linux, Gruvbox, Aesthetic Anime, and CozyPixels.
* **Personal feeds:** Select the sources and sub-collections that match your taste, with optional Wallhaven API-key controls.
* **Resolution choices:** Use Balanced (1080p HD) for reduced data usage and instant loading, or Original for higher-resolution artwork when available.
* **Wallpaper controls:** Refresh on demand, pin your favorite image, and adjust mature-content filtering.

### A workspace that feels like yours

Personalize more than just the wallpaper. Isekai Tab gives you granular control over the appearance and placement of your interface.

* **Color & atmosphere:** Choose curated accent palettes or enter your own custom hex color; adjust wallpaper dimming to keep text readable.
* **Typography:** Choose from built-in fonts such as JetBrains Mono, Fira Code, Space Grotesk, Outfit, Plus Jakarta Sans, Poppins, and Montserrat - or import your own `.ttf`, `.woff`, or `.woff2` files.
* **Clock & HUD:** Position the clock (left or center), switch between 12- and 24-hour time, and choose whether to display the date and seconds.
* **Waybar-inspired rail:** Place the quick-control rail on the right, at the top, or hide it entirely.
* **Bottom dock:** Choose between an always-visible dock and a proximity-aware hover experience.

### Keyboard-first by design

Open the command palette with <kbd>Space</kbd> or <kbd>Ctrl</kbd>+<kbd>K</kbd> to quickly find collections, filters, and settings. Inspired by Rofi and Wofi, it keeps everyday controls within reach, without digging through menus.

### Your wallpapers, even offline

Bring your own images into Isekai Tab. Import local wallpapers or entire folders, browse them in your personal library, and keep them stored securely in your browser with IndexedDB. Your collection is always available without an active internet connection.

### A quieter canvas when you need it

Press <kbd>I</kbd> to replace the wallpaper with a minimal dark canvas featuring the Isekai Tab crest. It's a visual mode for a cleaner screen, not the browser's private-browsing mode.

---


<h2 align="center" id="installation">Installation</h2>

<p align="center">
  Available for Firefox and Chromium-based browsers.
</p>

<table>
  <tr>
    <th align="center" width="50%">Firefox</th>
    <th align="center" width="50%">Chromium</th>
  </tr>
  <tr>
    <td align="center" valign="top">
      <br />
      <a href="https://addons.mozilla.org/firefox/addon/isekai-tab/">
        <img
          src="https://raw.githubusercontent.com/ZER0-X/badges/main/mozilla/firefox-addons/get-the-add-on.svg"
          height="48"
          alt="Get Isekai Tab on Firefox Add-ons"
        />
      </a>
      <br /><br />
      Install directly from the official
      <a href="https://addons.mozilla.org/firefox/addon/isekai-tab/">Firefox Add-ons</a>
      store.
      <br /><br />
      <sub>Also works with compatible Firefox-based browsers.</sub>
      <br /><br />
    </td>
    <td align="center" valign="top">
      <br />
      <a href="https://github.com/urstark/isekai-tab/releases/latest">
        <img
          src="https://raw.githubusercontent.com/rukamori/ArchiveTune/refs/heads/main/assets/badge_github.png"
          height="48"
          alt="Get Isekai Tab on GitHub"
        />
      </a>
      <br /><br />
      Get the latest Chromium build from
      <a href="https://github.com/urstark/isekai-tab/releases/latest">GitHub Releases</a>.
      <br /><br />
      <sub>Chrome Web Store release coming soon.</sub>
      <br /><br />
    </td>
  </tr>
</table>

<details>
<summary><b>Manual installation</b></summary>

<br />

**Chrome, Brave, Edge & other Chromium-based browsers**

1. Download the `isekai-tab-*-chrome.zip` package from the latest [GitHub Release](https://github.com/urstark/isekai-tab/releases/latest).
2. Extract the ZIP archive into a folder.
3. Open your browser's extension management page (`chrome://extensions`, `brave://extensions`, or `edge://extensions`).
4. Enable **Developer mode**.
5. Click **Load unpacked** and select the extracted extension directory.

**Firefox (temporary installation)**

1. Download the `isekai-tab-*-firefox.zip` package from the latest [GitHub Release](https://github.com/urstark/isekai-tab/releases/latest).
2. Extract the ZIP archive.
3. Open `about:debugging#/runtime/this-firefox`.
4. Click **Load Temporary Add-on**.
5. Select the `manifest.json` file from the extracted extension directory.

> **Note:** Temporary Firefox installations are removed when the browser restarts. For regular use, install Isekai Tab from [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/isekai-tab/).

</details>

---

## Keyboard Shortcuts

<div id="keyboard-shortcuts"></div>

| Shortcut | Action |
| :--- | :--- |
| <kbd>Space</kbd> or <kbd>Ctrl</kbd>+<kbd>K</kbd> | Open the command palette |
| <kbd>R</kbd> | Load a new wallpaper |
| <kbd>P</kbd> | Pin or unpin the current wallpaper |
| <kbd>N</kbd> | Toggle the NSFW filter |
| <kbd>I</kbd> | Toggle the minimal dark canvas |
| <kbd>M</kbd> | Open or close settings |
| <kbd>Esc</kbd> | Close the active palette or panel |

---

## Privacy by Design

Isekai Tab runs entirely client-side, with no account requirement, analytics, tracking, or telemetry built into the extension.

Your settings, custom fonts, and imported wallpapers are stored locally in your browser using browser storage and IndexedDB. Online wallpaper feeds still require requests to their respective providers; those providers may process requests under their own privacy policies. Using an online wallpaper source is not the same as sending your personal library to an Isekai Tab server.

The project is completely open source, so you can inspect how it works.

---

## Development

<div id="development"></div>

Isekai Tab is built with **Svelte 5**, **TypeScript**, and **WXT**. The project uses **pnpm** for package management.

```bash
# Clone the project
git clone https://github.com/urstark/isekai-tab.git
cd isekai-tab

# Install dependencies
pnpm install

# Start a development browser
pnpm dev              # Chromium
pnpm dev:firefox      # Firefox

# Type check
pnpm check

# Build production extensions
pnpm build            # Chromium
pnpm build:firefox    # Firefox

# Create distributable archives
pnpm zip              # Chromium
pnpm zip:firefox      # Firefox
```

Build outputs are generated by WXT under `.output/`; archive names depend on the package version and target browser.

---

## Contributing

Ideas, bug reports, design improvements, documentation updates, and pull requests are welcome.

Read the [Contributing Guide](CONTRIBUTING.md) before opening a pull request, and check the [Code of Conduct](CODE_OF_CONDUCT.md) for community expectations. For bugs and feature requests, open a discussion or report in [GitHub Issues](https://github.com/urstark/isekai-tab/issues).

---

## License

Isekai Tab is free and open source software under the [GPL-3.0-or-later](LICENSE) license.

<br />

<div align="center">
  <b>Your new tab. Your own world.</b><br />
  <sub>Made for the people who like their browser to feel personal.</sub>
</div>
