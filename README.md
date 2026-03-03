# SNACKRO

Enterprise-grade scalable web application with mobile-ready architecture.

## Architecture

```
snackro/
├── apps/
│   ├── web/              # Vite + React + TypeScript
│   └── mobile/           # Placeholder for React Native
├── packages/
│   ├── api/              # Axios client + RTK Query base API
│   ├── auth-core/        # Platform-agnostic auth logic
│   ├── config/           # Typed environment configuration
│   ├── features/         # Feature modules (auth slice, hooks, components)
│   ├── store/            # Redux Toolkit store configuration
│   ├── types/            # Shared TypeScript types
│   ├── ui/               # Design system tokens + UI primitives
│   └── utils/            # Platform-agnostic utilities
├── tests/                # Vitest + RTL + MSW tests
└── README.md
```

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Type check
npm run typecheck

# Lint
npm run lint

# Format
npm run format
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

| Variable                | Description                |
| ----------------------- | -------------------------- |
| `VITE_API_URL`          | Backend API base URL       |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 2.0 Client ID |

## Authentication Flow

1. User clicks **"Continue with Google"**
2. Google OAuth popup authenticates the user
3. Google returns an **ID Token** to the frontend
4. Frontend sends ID Token to backend (`POST /auth/google`)
5. Backend verifies token with Google, creates session
6. Backend returns **Access Token** + sets **Refresh Token** as HTTP-only cookie
7. Frontend stores access token in memory only (never in localStorage)
8. On 401, Axios interceptor automatically calls `/auth/refresh` and retries
9. On app load, `/auth/me` restores the session from cookies

## Tech Stack

| Layer     | Technology                             |
| --------- | -------------------------------------- |
| Build     | Vite 6                                 |
| UI        | React 19                               |
| Language  | TypeScript (strict mode)               |
| State     | Redux Toolkit                          |
| API       | RTK Query + Axios                      |
| Auth      | Google OAuth 2.0 (@react-oauth/google) |
| Routing   | React Router 7                         |
| Testing   | Vitest + React Testing Library + MSW   |
| Linting   | ESLint + Prettier                      |
| Git Hooks | Husky + lint-staged                    |

## Design System

Design tokens are defined in `packages/ui/src/theme/`:

- **tokens.ts** — Raw design values (colors, spacing, radius, shadows, typography)
- **theme.ts** — Semantic theme aliases
- **global.css** — CSS custom properties for all tokens

### UI Primitives

Pure presentation components with zero business logic:

- `Button` — Primary, secondary, ghost, danger variants
- `Input` — With label and error support
- `Card` — Surface container
- `Stack` — Flexbox layout primitive
- `Container` — Centered max-width wrapper
- `Loader` — Spinner component
- `Typography` — Text rendering with semantic variants

## Code Quality

- **ESLint** with TypeScript + React + Prettier integration
- **Prettier** for consistent formatting
- **Husky** pre-commit hook runs lint-staged
- **Strict TypeScript** (`strict: true`, `noImplicitAny: true`)

## Mobile Expansion

The `apps/mobile/` directory is a placeholder for React Native.
All shared packages in `packages/` are platform-agnostic:

- No DOM dependencies in shared code
- Auth logic reusable across web and mobile
- Store configuration accepts platform-specific middleware
- Types and utils are fully portable
