# Google Authentication Integration Guide

## Overview

This codebase now uses **token-based authentication** integrated with your backend API (`/api/v1/auth/fetch/token`). The implementation is secure, scalable, and follows enterprise best practices.

## Architecture

### Authentication Flow

1. **User clicks "Sign in with Google"** → Google OAuth popup
2. **Google returns ID token** → Client receives JWT from Google
3. **Client sends ID token to backend** → `POST /api/v1/auth/fetch/token`
4. **Backend validates & returns access token** → JWT access token + user data
5. **Client stores token in memory** → Automatically attached to all requests
6. **All API requests use Bearer token** → `Authorization: Bearer {token}`

### Security Features

✅ **JWT Bearer tokens** - Stateless, scalable authentication  
✅ **In-memory token storage** - No localStorage/sessionStorage vulnerabilities  
✅ **Automatic token injection** - All requests automatically authenticated  
✅ **401 auto-logout** - Invalid/expired tokens trigger automatic logout  
✅ **API response unwrapping** - Transparent handling of `{ success, data }` wrapper  
✅ **Type-safe** - Full TypeScript coverage with OpenAPI-generated types  

## API Endpoints

All endpoints follow the structure defined in `openapi.json`:

### Authentication
- `POST /api/v1/auth/fetch/token` - Exchange Google ID token for JWT
- `POST /api/v1/auth/logout` - Invalidate session
- `GET /api/v1/auth/check-user` - Check authentication status

### User Management
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update user profile

### Dashboard
- `GET /api/v1/dashboard` - Get dashboard data (progress + logs)

### Food Logs
- `GET /api/v1/food-logs` - List food logs
- `POST /api/v1/food-logs` - Create food log
- `GET /api/v1/food-logs/:id` - Get specific food log
- `PUT /api/v1/food-logs/:id` - Update food log
- `DELETE /api/v1/food-logs/:id` - Delete food log

## Configuration

### Environment Variables

Create `.env.local` in the root directory:

```bash
# Backend API URL (don't include /api/v1, it's added automatically)
VITE_API_URL=http://localhost:8000

# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Backend Requirements

Your backend API should:

1. **Accept Google ID tokens** at `POST /api/v1/auth/fetch/token`
   ```json
   Request: { "id_token": "eyJhbGc..." }
   Response: {
     "success": true,
     "data": {
       "access_token": "jwt-token-here",
       "token_type": "bearer",
       "user": { ...user data... }
     }
   }
   ```

2. **Validate JWT tokens** - Check `Authorization: Bearer {token}` header

3. **Return wrapped responses** - All responses follow:
   ```json
   {
     "success": true,
     "data": { /* actual data */ },
     "meta": { /* optional pagination */ }
   }
   ```

4. **Handle 401 responses** - Return 401 for invalid/expired tokens

## Key Files Changed

### Types & API Layer
- `packages/types/src/index.ts` - Updated types to match OpenAPI spec
- `packages/api/src/axios.ts` - Added Bearer token injection & response unwrapping
- `packages/api/src/baseApi.ts` - Updated RTK Query base with token support

### Auth Core
- `packages/auth-core/src/authService.ts` - Token-based auth service
- `packages/auth-core/src/tokenManager.ts` - In-memory token management
- `packages/auth-core/src/authTypes.ts` - Updated auth type exports

### Features
- `packages/features/src/auth/authSlice.ts` - Updated Redux slice for token flow
- `packages/features/src/auth/authApi.ts` - RTK Query endpoints for auth
- `packages/features/src/auth/useAuth.ts` - Updated hook for token-based auth
- `packages/features/src/dashboard/dashboardApi.ts` - **NEW** - Dashboard endpoints
- `packages/features/src/dashboard/index.ts` - **NEW** - Dashboard exports

### UI Components
- `apps/web/src/pages/DashboardPage.tsx` - Updated to use new User field names

## Usage Examples

### Login Flow

```tsx
import { GoogleLoginButton, useAuth } from "@snackro/features";

function LoginPage() {
  const { isAuthenticated } = useAuth();
  
  return (
    <GoogleLoginButton
      onSuccess={() => navigate("/dashboard")}
      onError={(error) => console.error(error)}
    />
  );
}
```

### Protected API Calls

```tsx
import { useGetDashboardQuery, useCreateFoodLogMutation } from "@snackro/features";

function Dashboard() {
  // Automatically authenticated with Bearer token
  const { data, isLoading } = useGetDashboardQuery();
  const [createLog] = useCreateFoodLogMutation();
  
  const handleAddLog = async () => {
    await createLog({
      food_name: "Chicken Breast",
      protein_grams: 30,
      quantity: 1,
      unit: "piece",
      log_date: "2026-03-03"
    });
  };
  
  return <div>{/* ... */}</div>;
}
```

### Direct API Calls (Axios)

```tsx
import { apiGet, apiPost } from "@snackro/api/axios";

// Automatically adds Bearer token & unwraps { success, data } response
const user = await apiGet<User>("/api/v1/users/me");
const result = await apiPost("/api/v1/food-logs", { ...logData });
```

## Testing Locally

1. **Start your backend API** on port 8000
2. **Update .env.local** with correct `VITE_API_URL`
3. **Install dependencies**: `npm install`
4. **Run dev server**: `npm run dev`
5. **Open browser**: http://localhost:5173
6. **Click "Sign in with Google"**
7. **Check Network tab** - Should see:
   - POST to `/api/v1/auth/fetch/token` with `id_token`
   - Response with `access_token`
   - Subsequent requests with `Authorization: Bearer ...`

## Troubleshooting

### "401 Unauthorized" after login
- Check backend is validating the JWT correctly
- Verify `Authorization: Bearer {token}` header is present
- Check token expiration time

### "Network Error"
- Verify `VITE_API_URL` points to running backend
- Check CORS settings on backend (allow your frontend origin)
- Ensure backend API is accessible

### Google login fails immediately
- Verify `VITE_GOOGLE_CLIENT_ID` is correct
- Check Google Cloud Console OAuth settings
- Ensure authorized JavaScript origins include your frontend URL

### API returns wrapped responses but data is undefined
- Backend might not be using the `{ success, data }` wrapper
- Check axios interceptor is unwrapping correctly
- Verify response structure matches OpenAPI spec

## Migration Notes

### Changes from Previous Implementation

**Before** (Cookie-based):
- Used HTTP-only cookies for refresh tokens
- Auto-refresh on 401
- Session restoration from cookies

**Now** (Token-based):
- JWT access tokens in memory
- No automatic refresh (backend handles token lifetime)
- Session restoration requires valid token

### User Object Changes

```typescript
// Old format
{ name, picture, createdAt, updatedAt }

// New format (snake_case to match API)
{ full_name, avatar_url, daily_protein_target, preferences, created_at, updated_at }
```

## Security Best Practices

✅ **Never log tokens** - Don't console.log access tokens  
✅ **HTTPS in production** - Always use HTTPS for token transmission  
✅ **Short token lifetime** - Backend should use 15-60 minute expiration  
✅ **Secure backend** - Validate all tokens server-side  
✅ **CORS configured** - Only allow trusted frontend origins  

## Next Steps

1. **Add refresh token flow** - Implement token refresh before expiration
2. **Add token persistence** - Optional: Store encrypted token for "remember me"
3. **Add loading states** - Better UX during API calls
4. **Add error boundaries** - Handle API errors gracefully
5. **Add analytics** - Track authentication events

## Support

For issues or questions about this integration:
- Check the OpenAPI spec in `openapi.json`
- Review network requests in browser DevTools
- Verify backend logs for authentication errors
- Test with curl/Postman to isolate frontend vs backend issues
