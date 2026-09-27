# cache

Platform-split persistence with the same API:

- `db.native.ts` — `expo-sqlite` (iOS/Android)
- `db.web.ts` — `localStorage` fallback (Expo web cannot bundle the SQLite WASM worker in this setup)

Import as `@/cache/db`; Metro picks the platform file automatically.
