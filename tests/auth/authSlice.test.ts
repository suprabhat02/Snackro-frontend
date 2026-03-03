/**
 * Tests for authSlice reducer
 */
import { describe, it, expect } from "vitest";
import authReducer, {
  forceLogout,
  clearAuthError,
} from "@snackro/features/auth/authSlice";
import { initialAuthState } from "@snackro/auth-core";

describe("authSlice", () => {
  it("should return initial state", () => {
    const state = authReducer(undefined, { type: "unknown" });
    expect(state).toEqual(initialAuthState);
  });

  it("should handle forceLogout", () => {
    const loggedInState = {
      ...initialAuthState,
      user: {
        id: "1",
        email: "test@test.com",
        name: "Test",
        picture: "",
        createdAt: "",
        updatedAt: "",
      },
      isAuthenticated: true,
    };
    const state = authReducer(loggedInState, forceLogout());
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it("should handle clearAuthError", () => {
    const errorState = {
      ...initialAuthState,
      error: "Some error",
    };
    const state = authReducer(errorState, clearAuthError());
    expect(state.error).toBeNull();
  });
});
