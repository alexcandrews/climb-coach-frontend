# Improvement Tasks

  ## 1. Environment & Configuration — ✅ Completed
  - Config now reads Expo `extra` values in `app/config.ts`, with shared `APP_CONFIG`/`API_CONFIG` exports.
  - `lib/api/client.ts` consumes the unified runtime base URL.
  - Added `.env.example` documenting required `EXPO_PUBLIC_*` values and the OpenAPI generation command.

  ## 2. Auth & Navigation UX
  - Update the password-reset redirect in `app/(auth)/login.tsx` to use `Linking.createURL` (or Expo’s auth helpers) instead of
  `window.location` for native compatibility.

  ## 3. Logging Hygiene
  - Wrap verbose `console.log` statements (e.g., Supabase creds in `lib/supabase.tsx`, upload logs in `lib/api/videos.ts`, history fetch logs
  in `app/(tabs)/history.tsx`) with `if (__DEV__)` or remove them for production safety.

  ## 4. Tooling & Quality Gates
  - Add ESLint and Prettier configs with matching npm scripts, integrate into CI/pre-commit.
  - Extend Jest beyond the single component test with at least one screen-level test covering upload/history flows.

  ## 5. Dependency & Build Hygiene
  - Remove `package-lock.json` from `.gitignore`, generate a fresh lockfile, and commit it.
  - Clean and git-ignore build artefacts that don’t belong in source (`dist/`, `shared/dist/`, `frontend/node_modules/`), ensuring new
  contributors start from a clean state.

  ## Newly Identified Issues
  - `npx tsc --noEmit` currently fails due to missing `Colors.tint`, an unused `@ts-expect-error`, and unresolved `@react-navigation/stack` types.
