# SNACKRO Mobile App

This is a placeholder for the React Native mobile application.

## Architecture

All business logic, state management, auth, and API communication
is already implemented in platform-agnostic shared packages:

- `@snackro/types` — Type definitions
- `@snackro/config` — Environment configuration
- `@snackro/utils` — Utility functions
- `@snackro/api` — Axios client & RTK Query base API
- `@snackro/auth-core` — Authentication service & guards
- `@snackro/store` — Redux store configuration
- `@snackro/features` — Feature modules (auth slice, hooks)

## Getting Started

When ready to implement the mobile app:

1. Initialize a React Native project here
2. Import shared packages from `../../packages/`
3. Implement platform-specific UI components
4. Reuse `@snackro/features` for auth, state, and API logic

NO DOM-specific dependencies exist in shared packages.
