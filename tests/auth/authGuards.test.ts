/**
 * Tests for auth-core guards
 */
import { describe, it, expect } from "vitest";
import {
  isAuthenticated,
  hasValidEmail,
  isSessionExpired,
} from "@snackro/auth-core";
import type { User } from "@snackro/types";

const mockUser: User = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  picture: "https://example.com/photo.jpg",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
};

describe("authGuards", () => {
  describe("isAuthenticated", () => {
    it("returns true for a valid user", () => {
      expect(isAuthenticated(mockUser)).toBe(true);
    });

    it("returns false for null", () => {
      expect(isAuthenticated(null)).toBe(false);
    });

    it("returns false for user with empty id", () => {
      expect(isAuthenticated({ ...mockUser, id: "" })).toBe(false);
    });
  });

  describe("hasValidEmail", () => {
    it("returns true for valid email", () => {
      expect(hasValidEmail(mockUser)).toBe(true);
    });

    it("returns false for invalid email", () => {
      expect(hasValidEmail({ ...mockUser, email: "not-an-email" })).toBe(false);
    });
  });

  describe("isSessionExpired", () => {
    it("returns true for past timestamp", () => {
      expect(isSessionExpired(Date.now() - 1000)).toBe(true);
    });

    it("returns false for future timestamp", () => {
      expect(isSessionExpired(Date.now() + 60000)).toBe(false);
    });
  });
});
