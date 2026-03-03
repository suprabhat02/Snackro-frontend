/**
 * Root Store Configuration
 *
 * Configures Redux store with:
 * - Auth slice (from features)
 * - UI slice
 * - RTK Query API middleware
 *
 * This is configurable — the actual store is created in the app layer
 * to support platform-specific middleware if needed.
 */
import { configureStore, type Reducer } from "@reduxjs/toolkit";
import { baseApi } from "@snackro/api/baseApi";
import type { AuthState } from "@snackro/auth-core";
import uiReducer from "./uiSlice";

/**
 * Create a configured Redux store
 * Auth reducer is injected from features to maintain separation.
 */
export function createAppStore(authReducer: Reducer<AuthState>) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // RTK Query uses non-serializable values in some actions
          ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        },
      }).concat(baseApi.middleware),
    devTools: import.meta.env?.DEV ?? true,
  });

  return store;
}

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
