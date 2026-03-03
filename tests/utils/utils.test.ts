/**
 * Tests for utility functions
 */
import { describe, it, expect } from "vitest";
import {
  isDefined,
  normalizeError,
  capitalize,
  clamp,
  createId,
  safeJsonParse,
} from "@snackro/utils";

describe("utils", () => {
  describe("isDefined", () => {
    it("returns true for defined values", () => {
      expect(isDefined("hello")).toBe(true);
      expect(isDefined(0)).toBe(true);
      expect(isDefined(false)).toBe(true);
    });

    it("returns false for null/undefined", () => {
      expect(isDefined(null)).toBe(false);
      expect(isDefined(undefined)).toBe(false);
    });
  });

  describe("normalizeError", () => {
    it("normalizes Error instances", () => {
      const result = normalizeError(new Error("test error"));
      expect(result.message).toBe("test error");
      expect(result.code).toBe("UNKNOWN_ERROR");
    });

    it("normalizes plain objects", () => {
      const result = normalizeError({
        message: "object error",
        code: "CUSTOM",
      });
      expect(result.message).toBe("object error");
      expect(result.code).toBe("CUSTOM");
    });

    it("normalizes unknown types", () => {
      const result = normalizeError("string error");
      expect(result.message).toBe("An unknown error occurred");
    });
  });

  describe("capitalize", () => {
    it("capitalizes first letter", () => {
      expect(capitalize("hello")).toBe("Hello");
    });

    it("handles empty string", () => {
      expect(capitalize("")).toBe("");
    });
  });

  describe("clamp", () => {
    it("clamps within range", () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-1, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe("createId", () => {
    it("creates unique IDs", () => {
      const id1 = createId();
      const id2 = createId();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe("string");
    });
  });

  describe("safeJsonParse", () => {
    it("parses valid JSON", () => {
      expect(safeJsonParse('{"a":1}', {})).toEqual({ a: 1 });
    });

    it("returns fallback for invalid JSON", () => {
      expect(safeJsonParse("not json", { default: true })).toEqual({
        default: true,
      });
    });
  });
});
