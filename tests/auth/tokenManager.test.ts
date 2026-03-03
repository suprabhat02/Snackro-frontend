/**
 * Tests for auth-core token manager
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  setAccessToken,
  getAccessToken,
  clearAccessToken,
  hasAccessToken,
} from "@snackro/auth-core";

describe("tokenManager", () => {
  beforeEach(() => {
    clearAccessToken();
  });

  it("starts with no access token", () => {
    expect(getAccessToken()).toBeNull();
    expect(hasAccessToken()).toBe(false);
  });

  it("can set and get access token", () => {
    setAccessToken("test-token");
    expect(getAccessToken()).toBe("test-token");
    expect(hasAccessToken()).toBe(true);
  });

  it("can clear access token", () => {
    setAccessToken("test-token");
    clearAccessToken();
    expect(getAccessToken()).toBeNull();
    expect(hasAccessToken()).toBe(false);
  });
});
