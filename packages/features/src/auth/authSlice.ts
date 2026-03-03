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
  getUserProfile,
  setAccessToken,
  clearAccessToken,
  initialAuthState,
} from "@snackro/auth-core";
import type { User } from "@snackro/auth-core";
import { baseApi } from "@snackro/api/baseApi";

// ─── Async Thunks ────────────────────────────────────────────

/**
 * Login with Google ID Token
 * Sends token to backend, receives JWT access token + user data
 */
export const googleLogin = createAsyncThunk<
  User,
  string,
  { rejectValue: string }
>("auth/googleLogin", async (idToken, { rejectWithValue }) => {
  try {
    const response = await loginWithGoogle(idToken);
    setAccessToken(response.access_token);
    
    // Transform user data from API format to app format
    const user: User = {
      id: response.user.id || "",
      email: response.user.email || "",
      full_name: response.user.full_name || response.user.name || "",
      avatar_url: response.user.avatar_url || response.user.picture || null,
      daily_protein_target: response.user.daily_protein_target || 100,
      preferences: response.user.preferences || {},
      created_at: response.user.created_at || new Date().toISOString(),
      updated_at: response.user.updated_at || new Date().toISOString(),
    };
    
    return user;
  } catch (error) {
    clearAccessToken();
    const message = error instanceof Error ? error.message : "Login failed";
    return rejectWithValue(message);
  }
});

/**
 * Restore session on app load
 * Calls /api/v1/users/me to check if token is valid
 */
export const restoreSession = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("auth/restoreSession", async (_, { rejectWithValue }) => {
  try {
    const user = await getUserProfile();
    return user;
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
  async (_, { dispatch, rejectWithValue }) => {
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
    /** Force logout (used by interceptors) */
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
        // Always clear auth state on logout, even if API call fails
        Object.assign(state, initialAuthState, { isInitialized: true });
      });
  },
});

export const { forceLogout, clearAuthError, setUser } = authSlice.actions;
export default authSlice.reducer;
