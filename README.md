# Card Buddy — Mobile App

React Native + Expo client for Card Buddy, written in **JavaScript** (no TypeScript).

## Stack

| Concern      | Choice                                     |
| ------------ | ------------------------------------------ |
| Runtime      | Expo SDK 54, React Native 0.81, React 19.1 |
| Navigation   | Expo Router (file-based, typed routes)     |
| Server state | TanStack React Query                       |
| Client state | Zustand                                    |
| HTTP         | Axios with backend envelope unwrapping     |
| Storage      | AsyncStorage + Expo SecureStore            |
| Styling      | Theme tokens + `StyleSheet` (light/dark)   |
| Tooling      | ESLint (flat config) + Prettier            |

## Getting started

```bash
npm install
cp .env.example .env    # point EXPO_PUBLIC_API_URL at card-buddy-backend
npm start               # then press i / a / w
```

The backend defaults to `http://localhost:3001/api`. On a **physical device** `localhost`
resolves to the phone itself, so use your machine's LAN IP (for example
`http://192.168.1.20:3001/api`).

## Scripts

| Script            | Purpose                   |
| ----------------- | ------------------------- |
| `npm start`       | Start the Expo dev server |
| `npm run ios`     | Open on iOS simulator     |
| `npm run android` | Open on Android emulator  |
| `npm run web`     | Open in the browser       |
| `npm run lint`    | Lint the project          |
| `npm run format`  | Format with Prettier      |
| `npm run doctor`  | Check dependency health   |

## Folder structure

```
card-buddy-app/
├── app/                        # Expo Router routes — keep these thin
│   ├── _layout.jsx             # providers, splash gating, root Stack
│   ├── index.jsx               # "/" -> renders a feature screen
│   └── +not-found.jsx          # unmatched deep links
│
├── src/
│   ├── api/                    # transport layer
│   │   ├── ApiError.js         # normalized error type
│   │   ├── client.js           # axios instance + interceptors
│   │   ├── endpoints.js        # every backend route in one place
│   │   └── queryClient.js      # React Query defaults
│   │
│   ├── components/
│   │   ├── layout/Screen.jsx   # themed, safe-area screen wrapper
│   │   └── ui/                 # design-system primitives (Button, Card, Text)
│   │
│   ├── config/env.js           # EXPO_PUBLIC_* config, single source of truth
│   ├── constants/              # storage keys and other shared constants
│   │
│   ├── features/               # vertical slices — the main unit of scaling
│   │   └── home/
│   │       ├── api/
│   │       ├── hooks/
│   │       └── screens/
│   │
│   ├── hooks/                  # shared hooks
│   ├── lib/                    # logger, storage, framework-agnostic helpers
│   ├── providers/              # AppProviders, ThemeProvider
│   ├── store/                  # zustand stores (client state only)
│   └── theme/                  # colors, tokens, assembled themes
│
└── assets/                     # icons and splash images
```

### Conventions

- **Routes stay thin.** A file in `app/` imports a screen from `src/features/*` and renders it.
  This keeps navigation structure separate from feature logic.
- **Features are isolated.** A feature never imports another feature's internals; shared code
  gets promoted into `src/`. See `src/features/README.md`.
- **Server state vs client state.** Anything fetched from the backend belongs in React Query;
  Zustand is only for local UI state.
- **Theme tokens only.** Components read `theme.colors.*` / `theme.spacing.*`, never raw hex
  values, so re-theming is a one-file change.
- Generated code carries a `#genai` comment.

## Path aliases

`@/` maps to `src/`, plus `@app/` and `@assets/`. Declared in `babel.config.js`
(for bundling) and `jsconfig.json` (for editor autocomplete) — update both together.

```js
import { Button } from '@/components/ui';
```

## Backend contract

The API answers with `{ success: true, data }` or `{ success: false, error }`. The axios
response interceptor unwraps `data` on success and throws an `ApiError` on failure, so
callers work with plain payloads:

```js
const health = await apiClient.get(endpoints.health); // already unwrapped
```

## Notes

- `typescript` is a dev dependency only because `eslint-config-expo` loads the TypeScript
  ESLint plugin. Application code is JavaScript.
- ESLint is pinned to 9.x; `eslint-plugin-react` does not yet support ESLint 10.
- The project targets **SDK 54** to match the Expo Go client installed on the test device.
  Expo Go supports exactly one SDK, so do not bump `expo` past 54 unless Expo Go is updated
  to match (or you switch to a development build).
- `SecureStore` has no web implementation, so `secureStorage` falls back to AsyncStorage on
  web. Treat web tokens as low-trust.
