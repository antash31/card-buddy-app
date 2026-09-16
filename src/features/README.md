# Features

Each feature is a self-contained vertical slice. Add a new folder per feature and keep
everything that belongs to it inside:

```
src/features/<feature>/
├── api/         # requests for this feature only
├── components/  # components used only by this feature
├── hooks/       # React Query hooks, feature logic
├── screens/     # screen components rendered by routes in app/
└── store/       # feature-local zustand slice (optional)
```

Rules that keep this scalable:

- Routes in `app/` stay thin — they import a screen from a feature and render it.
- A feature may import from `src/` shared layers (`components`, `lib`, `api`, `theme`).
- A feature should **not** import from another feature's internals. If two features need the
  same thing, promote it to a shared layer in `src/`.
- Onboarding step 3 is allowed to compose Card Nest's `AddCardScreen` because that is the real add flow, not a copy.
- SwipeMax and chat read the nest through Express (`/api/swipemax/*`), not by importing Card Nest internals.
