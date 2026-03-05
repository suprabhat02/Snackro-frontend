/**
 * Auth Slice — Redux state management for authentication
 */
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  loginWithGoogle,
  logout as logoutService,
  checkUser,
  getUserProfile,
  setAccessToken,
  clearAccessToken,
  initialAuthState,
} from "@snackro/auth-core";
import type { User } from "@snackro/auth-core";
import { baseApi } from "@snackro/api/baseApi";

// ─── Async Thunks ─────────────────────────────────────────────

/**
 * Login with Google ID Token.
 *
 * On 401: the Google account has no Snackro record — return a clear error
 * message so the LoginPage can surface it via window.alert.
 */
export const googleLogin = createAsyncThunk<
  User,
  string,
  { rejectValue: string }
>("auth/googleLogin", async (idToken, { rejectWithValue }) => {
  try {
    const response = await loginWithGoogle(idToken);
    setAccessToken(response.access_token);
    // Fetch the complete user record so weight_kg / height_cm / lifestyle
    // are always populated in Redux (the token-exchange response may only
    // return a partial user depending on the backend implementation).
    try {
      return await getUserProfile(response.user.email);
    } catch {
      return response.user as User;
    }
  } catch (error: unknown) {
    clearAccessToken();
    const status =
      error && typeof error === "object" && "status" in error
        ? (error as { status: number }).status
        : 0;
    if (status === 401) {
      return rejectWithValue(
        "You are not an existing user. Please start by creating a new account.",
      );
    }
    return rejectWithValue(
      error instanceof Error ? error.message : "Login failed",
    );
  }
});

/**
 * Restore session on app load.
 * Calls /api/v1/auth/check-user — identity derived from Bearer token.
 */
export const restoreSession = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("auth/restoreSession", async (_, { rejectWithValue }) => {
  try {
    const result = await checkUser();
    if (result.authenticated && result.user) {
      // Fetch complete profile so all body metrics are present after a
      // page refresh / session restore, not just the basic user object.
      try {
        return await getUserProfile(result.user.email);
      } catch {
        return result.user;
      }
    }
    return rejectWithValue("No active session");
  } catch (error) {
    clearAccessToken();
    const message = error instanceof Error ? error.message : "Session expired";
    return rejectWithValue(message);
  }
});

/**
 * Logout — clear everything
 */
export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logoutUser",
  async (_, { dispatch }) => {
    try {
      await logoutService();
    } catch {
      // Even if backend call fails, still clear client state
    }
    clearAccessToken();
    dispatch(baseApi.util.resetApiState());
    return;
  },
);

// ─── Slice ───────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState: initialAuthState,
  reducers: {
    /** Force logout (used by axios interceptors on 401) */
    forceLogout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      clearAccessToken();
    },
    clearAuthError(state) {
      state.error = null;
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    // ── Google Login ──
    builder
      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload ?? "Login failed";
      });

    // ── Session Restore ──
    builder
      .addCase(restoreSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.user = action.payload;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.isInitialized = true;
        state.user = null;
      });

    // ── Logout ──
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        Object.assign(state, initialAuthState, { isInitialized: true });
      })
      .addCase(logoutUser.rejected, (state) => {
        Object.assign(state, initialAuthState, { isInitialized: true });
      });
  },
});

export const { forceLogout, clearAuthError, setUser } = authSlice.actions;
export default authSlice.reducer;
