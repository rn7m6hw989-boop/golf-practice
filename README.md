# Golf Practice

A personal practice tracker for putting drills, based on the benchmark grading scorecards in Mark Broadie's *Every Shot Counts*. Records sessions for the 5/10/15/20/30/40-foot point games, the spiral game, and the fall-line green-reading drill, and shows your performance relative to tour pro and amateur benchmarks. Local-only storage — no accounts, no servers, no tracking. Built as a PWA so it works offline once installed.

## Local development

Requires Node.js 20+.

```bash
npm install
npm run dev      # runs at http://localhost:5173/golf-practice/
npm run build    # builds to dist/
npm run preview  # serves the production build locally
```

## Deployment

The repo is configured to auto-deploy to GitHub Pages on every push to `main`. To set it up the first time:

1. Push this repo to GitHub
2. Go to **Settings → Pages** in your repo
3. Set **Source** to **GitHub Actions** (not "Deploy from a branch")
4. Push a commit to trigger the first deploy. Watch the **Actions** tab.
5. After deploy completes, the site is live at `https://<your-username>.github.io/golf-practice/`

## Installing on your phone

Once the site is live, open the URL in Safari (iOS) or Chrome (Android), then:

- **iOS:** tap the share button → Add to Home Screen
- **Android:** tap the three-dot menu → Install app / Add to Home Screen

The icon goes on your home screen and opens fullscreen with offline support.

## Project structure

```
src/
├── main.jsx              React entry point
├── App.jsx               Root component, navigation state
├── theme.js              Color palette + tone styles
├── drills.js             Drill registry, categories, outcomes
├── storage.js            Session storage (IndexedDB via idb-keyval)
├── helpers.js            Formatters, benchmark/comparison utilities
├── components/           Reusable UI primitives
├── views/                Screen-level components
└── sessions/             In-progress drill components (one per session type)
```

Adding a new drill: add an entry to `DRILLS` in `src/drills.js` and choose a `sessionType` that matches an existing session component, or add a new session component and register it in `src/sessions/SessionView.jsx`.
