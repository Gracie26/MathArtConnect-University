# MathArt Connect

A mobile app that combines mathematics and art. Designed to support Calculus learning.

Built with Expo (SDK 57), React Native, TypeScript, Expo Router and Supabase.

## Quick start

```bash
npm install
npx expo start
```

Then press `a` (Android emulator), `i` (iOS simulator, macOS only) or `w` (web), or scan the QR code with Expo Go.

The app runs without a backend. Until Supabase is configured, it shows a "backend not connected" notice and does not save progress. To connect a backend, copy `.env.example` to `.env.local` and fill in the values (see [docs/EXTERNAL_SETUP.md](docs/EXTERNAL_SETUP.md)).

## Scripts

| Command             | Purpose                         |
| ------------------- | ------------------------------- |
| `npm start`         | Start the Expo dev server       |
| `npm run typecheck` | TypeScript (`tsc --noEmit`)     |
| `npm run lint`      | ESLint via `expo lint`          |
| `npm test`          | Jest unit tests (see note)      |
| `npm run check`     | Typecheck + lint + tests        |
| `npm run format`    | Prettier                        |
| `npm run doctor`    | `expo-doctor` dependency checks |

Run tests with `npm test`, not bare `npx jest`. On Windows, VS Code opens the folder as `c:\…`, and Jest then loads React twice (once per spelling of the drive letter), so every full-screen test fails with "Invalid hook call". `npm test` starts Jest from the `C:\…` spelling (`scripts/run-jest.js`).

## Docs

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): folder layout, theming, content model, services
- [docs/ANSWER_CHECKING.md](docs/ANSWER_CHECKING.md): how answers and My Working steps are checked, and the limits
- [docs/EXTERNAL_SETUP.md](docs/EXTERNAL_SETUP.md): Supabase, EAS and sign-in provider setup
