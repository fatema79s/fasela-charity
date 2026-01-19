# Bug Fixes & Code Quality Log

This file documents the technical contributions I've made to the "Fasela" project, focusing on improving code quality and resolving ESLint issues.

==================================================================================

## Navigation component:

## 1- Refactor logout function (Navigation component)
* **Issue:** - Empty catch block (`no-empty` error) at line 76.
  - Using `any` type for error handling, which weakens TypeScript's benefits.
* **Solution:** - Added a descriptive comment inside the empty catch block to explain its purpose.
  - Replaced `any` with a proper error check (`instanceof Error`) to ensure type safety.

## 2- Update tailwind configuration (Tailwind Config)
* **Issue:** - Using the old `require()` syntax instead of `import` in a TypeScript file (`no-require-imports`).
* **Solution:** - Converted Tailwind plugins to `ES6 Modules` (using `import`).
  - Updated the `plugins` array to follow TypeScript standards. 

===================================================================================  
## KidCard Component:

## 3- Resolve explicit any (KidCard Component)
* **Issue:** - Multiple properties (`onDonate`, `onViewDetails`, `onShare`) and arrays (`certificates`, etc.) were using the `any` type.
  - This triggered `no-explicit-any` errors and weakened type safety.
* **Solution:** - Replaced `any` in functions with specific types (like `string`).
  - Replaced `any[]` with `Record<string, unknown>[]` to comply with strict ESLint rules.
  - Using `unknown` ensures we handle data safely and professionally.

===================================================================================