# store

Zustand auth session.

Token persistence is platform-split (`token-storage.native.ts` / `token-storage.web.ts`):
SecureStore on native, `localStorage` on web (SecureStore’s web module is empty in Expo 57).
