# Improvement Tasks

  ## 1. Environment & Configuration — ✅ Completed
  - Config now reads Expo `extra` values in `app/config.ts`, with shared `APP_CONFIG`/`API_CONFIG` exports.
  - `lib/api/client.ts` consumes the unified runtime base URL.
  - Added `.env.example` documenting required `EXPO_PUBLIC_*` values and the OpenAPI generation command.

  ## 2. Auth & Navigation UX — ✅ Completed
  - `app/(auth)/login.tsx` now uses `Linking.createURL('/reset-password')` so the Supabase reset flow works on native and web.

  ## 3. Logging Hygiene — ✅ Completed
  - Added local `debugLog` helpers so info-level logs in `lib/supabase.tsx`, `lib/api/videos.ts`, and `app/(tabs)/history.tsx` only emit during development.

  ## 4. Tooling & Quality Gates
  - Add ESLint and Prettier configs with matching npm scripts, integrate into CI/pre-commit.
  - Extend Jest beyond the single component test with at least one screen-level test covering upload/history flows.

  ## 5. Dependency & Build Hygiene — ✅ Completed
  - Added the generated `package-lock.json` to source control and refreshed it with `npm install --package-lock-only`.
  - Extended `.gitignore` to cover nested build outputs like `shared/dist` and `frontend/node_modules/` so clones start clean.

  ## Newly Identified Issues
  - `npx tsc --noEmit` currently fails due to missing `Colors.tint`, an unused `@ts-expect-error`, and unresolved `@react-navigation/stack` types.
