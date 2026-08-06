# Lunix-Portfolio

An interactive, desktop/terminal portfolio for **Lunixizm**

Instead of a plain landing page, the site boots into a simulated desktop: a draggable/resizable **Browser** window, a working **Terminal**, a **Resume** viewer and a **Social** hub.

Live at **[lunixizm.website](https://lunixizm.website)**

---

## Features

- **Desktop simulation** — desktop icons, windows with title bar, drag & resize, maximize/minimize/close, focus stacking, fullscreen toggle.
- **Working terminal** — type commands, tab autocompletion, command history (up/down arrows), `help`, `projects go <id>` and `socials go <id>` shortcuts.
- **Browser window** — hero section with bio, quick links and highlight cards.
- **Resume window** — in-app PDF viewer with download button.
- **Social hub** (`/social`) — a live "am I available?" page:
  - Status computed from the weekly schedule in `public/social/config.json` (school hours Mon–Fri 09:00–17:00, everything else = available), shown in the visitor's own timezone.
  - Fullscreen video background streamed from YouTube with muted autoplay, sound controls, and a "video-only" mode toggle that hides everything but the video and the sound bar: **Bad Apple!!** PV (Rule 86: *"If it exists, it can play Bad Apple"*) on mobile, a selected desktop video on larger screens.
- **Responsive** — on mobile the site switches to the browser window maximized, windows use dynamic viewport units (`dvh`) so they are never cut off behind Samsung-style browser menu bars, and the desktop wallpaper is replaced with a colorful gradient.

## Tech stack

- [React 18](https://react.dev) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev) 6
- [styled-components](https://styled-components.com) + styled-normalize
- [lodash](https://lodash.com)
- [Vitest](https://vitest.dev) + Testing Library
- Package manager: [pnpm](https://pnpm.io) (pinned via `packageManager`)

## Getting started

Prerequisites: Node.js and [pnpm](https://pnpm.io/installation).

```bash
# install dependencies 
pnpm install --frozen-lockfile

# start the dev server (http://localhost:8001)
pnpm dev

# type-check + production build dist/
pnpm build

# preview the production build
pnpm preview
```

Other scripts:

```bash
pnpm test          # run tests (watch mode)
pnpm test:run      # run tests once
pnpm lint          # eslint
pnpm format        # prettier --write
pnpm format:check  # prettier --check
```

## Terminal commands

| Command       | Description                                    |
| ------------- | ---------------------------------------------- |
| `about`       | about Lunixizm                                  |
| `clear`       | clear the terminal (`Ctrl + l` also works)      |
| `echo`        | print out anything                              |
| `email`       | send an email                                   |
| `resume`      | open the resume window                          |
| `help`        | check available commands                        |
| `history`     | view command history                            |
| `projects`    | view projects that I've coded                   |
| `pwd`         | print current working directory                 |
| `socials`     | open the social hub window                      |
| `sudo`        | easter egg                                      |
| `welcome`     | display the hero section                        |
| `whoami`      | about current user                              |
| `neofetch`    | easter egg                                      |
| `uname`       | easter egg                                      |
| `ls`          | easter egg                                      |

### Shortcuts

- `projects go <id>` — opens the matching GitHub repo in a new tab (tab completion: `projects go <Tab>`).
- `socials go <id>` — opens the matching social link (GitHub / LinkedIn / Mail).

## Project structure

```
public/
  social/                 # standalone social/availability hub
    index.html            #   entry (device-aware YouTube background, Social hub)
    config.json           #   all availability data & messages (edit this)
    musaitlik/            #   availability page assets
  robots.txt              # /social disallowed for crawlers
  sitemap.xml
  favicon.webp
  Resume.pdf / Resume.html
src/
  App.tsx                 # desktop state: windows, z-index, focus, mobile mode
  components/
    styles/               # styled-components: GlobalStyle, themes, per-window styles
    Terminal.tsx          # terminal shell (commands, history, tab completion)
    TerminalWindow.tsx    # draggable/resizable terminal frame
    WelcomeBrowserWindow.tsx
    ResumeWindow.tsx
    SocialWindow.tsx
    commands/             # one component per command (about, help, projects, …)
  hooks/useTheme.ts
  utils/funcs.ts          # arg parsing, redirect + autocompletion helpers
```
