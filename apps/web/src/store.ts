/**
 * App Store — creates the Redux store for the web application
 */
import { createAppStore } from "@snackro/store";
import { authReducer } from "@snackro/features";
import { setForceLogoutHandler } from "@snackro/api/axios";
import { forceLogout } from "@snackro/features";

export const store = createAppStore(authReducer);

// Wire up axios force logout
setForceLogoutHandler(() => {
  store.dispatch(forceLogout());
});

export type WebRootState = ReturnType<typeof store.getState>;
export type WebAppDispatch = typeof store.dispatch;
