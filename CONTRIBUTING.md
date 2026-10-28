# ⛩️ Contributing to Isekai Tab

Hey there! Thanks for your interest in making **Isekai Tab** even better. 🌸

Isekai Tab is an open source passion project licensed under GPL-3.0. Whether you want to fix a bug, suggest an anime art feed, tune performance, or add a Linux ricing feature, your contributions are very welcome!

---

## Ways to Contribute

* **Report bugs**: If something is broken, laggy, or looks weird on your screen, [open an issue](https://github.com/urstark/isekai-tab/issues) with details about your browser, OS, and what happened.
* **Suggest ideas**: Want a new wallpaper feed (e.g. Catppuccin, Tokyo Night), a new command palette action, or a customization option? Open an issue or discussion!
* **Submit code**: Pick up an open issue or implement an improvement and send a Pull Request.

---

## Getting Started Locally

### Prerequisites

* **Node.js**: v20 or newer
* **pnpm**: v9 or newer (`corepack enable pnpm` or `npm i -g pnpm`)

### Setup Steps

1. **Fork and clone** the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/isekai-tab.git
   cd isekai-tab
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Start the development server**:
   ```bash
   pnpm dev
   ```
   WXT will build an unpacked development extension in `.output/chrome-mv3`.

4. **Load into your browser**:
   * **Chrome / Brave / Edge**: Go to `chrome://extensions`, enable **Developer mode**, click **Load unpacked**, and select `.output/chrome-mv3`.
   * **Firefox**: Run `pnpm dev:firefox` and load temporary add-on in `about:debugging`.

Changes to Svelte files and styles will hot-reload automatically.

---

## Guidelines & Philosophy

We like to keep things simple, clean, and fast. Here are a few things to keep in mind when writing code:

1. **Lightweight & Fast**
   New tabs should open instantly without lag or CPU spikes. Keep memory allocations minimal, avoid heavy polling loops, and optimize asset loading.

2. **Clean & Self-Documenting Code**
   Write code that explains itself through good naming and clean structure. Avoid cluttering files with obvious comments. Save comments only for tricky workarounds or API quirks.

3. **Natural Human Commit Messages**
   Write simple, direct commit messages (e.g. `Add Tokyo Night font preset` or `Improve drawer animation smoothness`).

4. **Verify Before Submitting**
   Before pushing, always run:
   ```bash
   # Type check
   pnpm check

   # Test production build
   pnpm build
   ```
   Make sure there are no TypeScript or Svelte compiler warnings.

---

## Branching & Pull Request Workflow

We maintain two primary branches:
* **`main`**: Stable, production-ready releases.
* **`dev`**: Active development. All new work lands here first before being merged into `main`.

### Steps to contribute:

1. Always branch off the **`dev`** branch into your own feature or bugfix branch:
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b my-feature-name
   ```
2. Make your changes and verify with `pnpm check` and `pnpm build`.
3. Commit cleanly and push to your fork:
   ```bash
   git push origin my-feature-name
   ```
4. Open a Pull Request targeting the **`dev`** branch (not `main`). If you changed something visual, attaching a quick screenshot or GIF helps a lot!

---

## 🌸 Community Spirit

Please review our [Code of Conduct](CODE_OF_CONDUCT.md). Be respectful, helpful, and kind to everyone in issues and PR discussions.

Thank you for helping make Isekai Tab awesome!
