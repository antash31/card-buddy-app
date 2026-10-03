# Card Buddy App — Architecture

## Layers

```
app/                 Expo Router routes (thin — render feature screens)
  │
  ▼
src/features/*       Vertical slices: screens + hooks + feature API
  │
  ├──► src/api       Axios client, error normalization, React Query config
  ├──► src/store     Zustand (client-only state)
  ├──► src/theme     Design tokens
  └──► src/lib       Logger, storage adapters
```

## Data flow

```
Screen ──useQuery/useMutation──► feature/api ──apiClient──► card-buddy-backend (:3001)
                                                                    │
                                                                    ▼
                                                            Supabase (DB + Auth)
```

1. A screen calls a feature hook (`useSignIn`, `useConnectionStatus`, …).
2. The hook delegates to a feature API function that uses `apiClient`.
3. `apiClient` attaches the bearer token from `secureStorage`, then unwraps the backend's
   `{ success, data | error }` envelope — returning `data` or throwing an `ApiError`.
4. **Auth goes through the backend**, not straight to Supabase: the app posts credentials to
   `/api/auth/*` and Express proxies Supabase. The app only ever holds the anon key.
5. React Query caches server data; Zustand holds the session and local UI state.

The one exception is avatar upload, which goes directly to Supabase Storage — the bucket's RLS
policy enforces the same per-user rule Express would, so proxying the bytes would add a hop
without adding a check.

## Auth & routing

```
app/(auth)/        welcome, sign-in, sign-up, forgot-password, verify-email
app/onboarding/    identity, financial snapshot, optional cards, optimization goal
app/(app)/         signed-in area — Tabs: index (Card Nest), swipemax, add-card, profile; chat has href: null
```

`useAuthGate` (mounted once in the root layout) owns every redirect:

| State | Destination |
| ----- | ----------- |
| `loading` | `BootSplash` — no redirect until the session is known |
| `unauthenticated` | `/welcome` |
| authenticated, onboarding pending | First incomplete onboarding step from the API |
| authenticated, set up | `/` |

No screen guards itself, so a route cannot become reachable by forgetting to add a check. Note
that only one route may resolve to `/`, which is why the landing screen lives at `/welcome`.

`GET /api/profile/onboarding` derives the resume step from persisted profile and spend-profile
fields. The optional cards step directly composes Card Nest's `AddCardScreen`; a transient,
non-persisted flow flag allows an explicit skip to advance to the goal during the current session.
`profiles.onboarding_completed_at` remains the only completion authority.

### Session lifecycle

- Tokens live in `secureStorage`; `authStore` holds user + profile.
- On a 401 the axios interceptor refreshes once and replays the request. Concurrent 401s share a
  single in-flight refresh, because refresh tokens are single-use.
- The client reports refreshes and hard expiries back through `src/api/sessionBridge.js`, which
  exists so the client and the store never import each other.

## Key decisions

| Decision                           | Reason                                                       |
| ---------------------------------- | ------------------------------------------------------------ |
| Expo Router over React Navigation  | File-based routing, deep linking and typed routes by default |
| Feature-sliced `src/features/*`    | Scales by feature rather than by file type                   |
| React Query for all server state   | Caching, retries and loading states without bespoke reducers |
| Zustand for client state only      | Minimal boilerplate; avoids duplicating server state         |
| Envelope unwrapping in interceptor | UI never repeats `if (res.success)` checks                   |
| Semantic theme tokens              | Re-theming and dark mode stay single-file changes            |
| Auth proxied through Express       | One auditable place for credentials, throttling and errors   |
| Session in Zustand, not React Query| Routing needs a synchronous "is this person signed in?"      |
| Hand-built motion kit over gluestack | Springs, gesture handoff and materials gluestack lacks     |

## Design system — "Lumen"

Soft cards on a lit canvas, one blue accent, and a few panes of liquid glass. The full specification
(tokens, the glass recipe, every component, contrast figures, rules) is in `DESIGN_SYSTEM.md` next to
this file; `.impeccable.md` at the repo root records the design intent.

`src/theme/` holds the token layers:

| File | Contents |
| ---- | -------- |
| `fonts.js` | Manrope (500 / 600 / 700 / 800) + the `loadAsync` map |
| `tokens.js` | 4pt spacing, generous radii, the type scale, shadows, `metrics` |
| `colors.js` | Cool canvas + ink neutrals, one blue accent, status colours, illustration accents |
| `materials.js` | Glass presets, ambient canvas and light pools, card/field/button materials, card-art tones |
| `motion.js` | Spring presets calibrated to Apple's damping/response pairs, incl. `liquid` |

**Type.** One family. Weight is chosen by *family* (`fonts.text.semibold`), never `fontWeight` —
static Google Font instances are separate files. `textStyles` bundles family + size + leading +
tracking so they cannot drift apart.

**Colour.** Semantic tokens only; contrast is computed and tabulated in `DESIGN_SYSTEM.md`. Blue is
the only colour a control is painted in; illustration accents are decoration only.

**Surfaces.** `AmbientBackground` paints the canvas; `Surface` is the soft white card; `Glass` is the
five-layer liquid-glass pane (blur → fill → sheen → edge → shadow) used only for things that float.
`Surface` provides a `SurfaceContext` so fields recess on cards. Glass degrades to no-blur on Android
and to opaque under reduce-transparency.

The components built on all this:

| Folder | Contents |
| ------ | -------- |
| `components/motion/` | `PressableScale`, `Reveal` |
| `components/surfaces/` | `AmbientBackground`, `Surface`, `Glass`, `Rule`, `SurfaceContext` |
| `components/layout/` | `AppScreen`, `AuthLayout`, `ScreenHeader`, `SectionLabel`, `BootSplash`, `Screen` |
| `components/navigation/` | `TabBar` (floating glass capsule with a spring-driven lens) |
| `components/forms/` | `TextField`, `PasswordStrength`, `FieldError`, `FormBanner` |
| `components/actions/` | `PrimaryButton`, `SecondaryButton`, `SocialButton`, `TextLink`, `IconButton`, `Chip` |
| `components/brand/` | `BrandMark`, `CardArt`, `CardStack`, `cardTone` (pure helpers, unit-tested) |
| `components/icons/` | Inline SVG glyphs on a 1.8-stroke grid (no icon dependency) |

`ScreenHeader` is the repeated motif — blue eyebrow, heavy title, optional description, one header
action. Grouped content is a column of `Surface` cards, labelled by `SectionLabel`.

Motion rules worth preserving: feedback fires on press-*down*, springs (never fixed durations)
so animations can be interrupted and reversed, critical damping unless the user's gesture
carried momentum, and velocity handed from a released drag into the spring.

## Cross-cutting concerns

- **Providers** are composed once in `src/providers/AppProviders.jsx`, mounted by the root
  layout: gesture handler → safe area → React Query → theme.
- **Bootstrap/splash**: `useAppReady` hydrates persisted settings *and loads the two typefaces*
  before the splash screen hides, avoiding a theme flash and a font reflow on launch. A font
  failure still resolves the gate — a system-font fallback beats an app that never opens.
  `BootSplash` then covers the session check.
- **Theming** resolves from a stored preference (`system` / `light` / `dark`) combined with
  the OS appearance.
- **Accessibility**: `useMotionPreferences` exposes reduce-motion and reduce-transparency.
  Slides become cross-fades and glass becomes solid — feedback is never removed outright.

## Extending

Add a feature by creating `src/features/<name>/` with `api/`, `hooks/`, `screens/`, then a
route in `app/` that renders the screen. Promote shared code to `src/` only when a second
feature needs it.
