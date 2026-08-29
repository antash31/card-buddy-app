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
app/(app)/         signed-in area — a Tabs navigator: index (Card Nest), add-card, profile
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

## Design system — "Statement"

The governing metaphor is a private bank's printed statement: letterpress on warm stock, hairline
rules instead of boxes, wide margins, engraved numerals. See `.impeccable.md` at the repo root for
the full design context and the reasoning behind each choice.

`src/theme/` holds five token layers:

| File | Contents |
| ---- | -------- |
| `fonts.js` | The two families + the `loadAsync` map |
| `tokens.js` | 4pt spacing, tight radii, the type scale, `metrics` |
| `colors.js` | Warm paper/ink neutrals + a single pine accent |
| `materials.js` | Canvas wash, the one blurred chrome surface, card plates |
| `motion.js` | Spring presets calibrated to Apple's damping/response pairs |

**Type.** Bodoni Moda (Didone) for titles and figures; Golos Text for everything read at small
size. Weight is chosen by *family* (`fonts.text.semibold`), never `fontWeight` — static Google
Font instances are separate files, so `fontWeight` gets you synthetic bolding on Android and
nothing on iOS. `textStyles` bundles family + size + leading + tracking so they cannot drift apart.

**Colour.** Two hues: paper/ink at ~70°, pine at 155°. Designed in OKLCH for perceptual
uniformity, shipped as hex because React Native cannot parse `oklch()`; the source coordinate sits
in a comment beside every token. The accent appears on roughly one element per screen.

**Surfaces.** Flat paper and `Rule` hairlines carry the layout. `Panel` exists for the rare case
that genuinely needs containing and is never nested. There is exactly one translucent surface in
the product — the tab bar, which really does float over scrolling content.

The components built on all this:

| Folder | Contents |
| ------ | -------- |
| `components/motion/` | `PressableScale`, `Reveal` |
| `components/surfaces/` | `PaperBackground`, `Rule`, `Panel` |
| `components/layout/` | `AppScreen`, `AuthLayout`, `ScreenHeader`, `BootSplash`, `Screen` |
| `components/navigation/` | `TabBar` |
| `components/forms/` | `TextField`, `PasswordStrength`, `FieldError`, `FormBanner` |
| `components/actions/` | `PrimaryButton`, `SecondaryButton`, `SocialButton`, `TextLink` |
| `components/brand/` | `BrandMark`, `CardStack` |
| `components/icons/` | Inline SVG glyphs on a 1.5-stroke grid (no icon dependency) |

`ScreenHeader` is the repeated motif — tracked-caps eyebrow, Didone title, closing rule. Because
the eyebrow does the labelling, screens need no section headings, which is what keeps them quiet.

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
