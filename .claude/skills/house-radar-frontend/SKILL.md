---
name: house-radar-frontend
description: "Trigger: apps/web, React, TanStack Query, TanStack Router, Zustand, use case, container, presentational, atomic design, i18n. Write House Radar frontend code per conventions."
license: Apache-2.0
metadata:
  author: "JSisques"
  version: "1.0"
---

## Activation Contract

Load when creating or editing code in `apps/web`.

## Hard Rules

- Layout: `src/contexts/<context>/{domain,application,infrastructure,presentation}`, `src/shared/`, `src/design-system/`. Dependencies point inward.
- Every operation has a use case (`application/use-cases/<verb-noun>/`), even when it only delegates to a port.
- Hooks are the only bridge from `presentation` to `application`; `application` never imports stores.
- Adapters are injected through a provider (composition root). No module-scope `new UseCase(repo)`; no `vi.mock` in specs.
- Server data lives only in TanStack Query, never in Zustand. Shared client state in Zustand; local state in `useState`/`useReducer`.
- Query keys come from the context's key factory. Search params are typed with zod in the route (TanStack Router).
- Texts via `useTranslation` (one namespace per context) behind the i18n adapter; prices, areas and dates via `Intl` in the adapter.
- Containers fetch; presentational components only render props. Reusable pieces go in `shared/presentation/components/{atoms,molecules,organisms,templates}`.
- One folder per component with `.spec.tsx` and `.stories.tsx`. Named exports, no barrels, aliases, kebab-case with role suffix. No `any`.
- API access only through the OpenAPI client wrapped by repository adapters. Mock with MSW.

## Decision Gates

| Need | Do |
| --- | --- |
| Data from API | Port in `domain`, adapter in `infrastructure`, use case, hook with TanStack Query |
| State shared across screens (not server data) | Zustand store in `presentation/stores` |
| Filter that belongs in the URL | Route search param + zod schema |
| Component fetches data | Split into container + presentational |
| Reusable across contexts | `shared/presentation/components` at the right atomic level |

## Execution Steps

1. Read `references/conventions.md`; copy the matching file from `assets/`.
2. RED: write the spec first (use case, hook or component) and confirm it fails.
3. GREEN: implement the minimum in the correct layer folder.
4. Refactor with specs green; add the story and the translation keys for every locale.
5. Run Vitest for the package; run ESLint/Prettier when installed.

## Output Contract

Return: files created or changed, RED and GREEN results, checks run, and any rule you could not satisfy.

## References

- `references/conventions.md`
- `assets/` templates (use case, port, search filters model, hook, container, presentational, query keys)
