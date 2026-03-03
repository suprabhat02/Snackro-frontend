/**
 * @snackro/types - Shared type definitions
 * Platform-agnostic types for the entire SNACKRO ecosystem
 */

// ─── Auth Types ───────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: User;
  isAuthenticated: boolean;
  expiresAt: number;
}

export interface GoogleCredentialResponse {
  credential: string;
  clientId: string;
  select_by: string;
}

export interface AuthTokens {
  accessToken: string;
  /** Refresh token is never exposed to client — HTTP-only cookie */
}

export interface LoginRequest {
  idToken: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface AuthMeResponse {
  user: User;
}

// ─── API Types ────────────────────────────────────────────────
export interface ApiError {
  status: number;
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ─── UI Types ─────────────────────────────────────────────────
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";
export type TypographyVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "body"
  | "caption"
  | "label";

// ─── Feature Types ────────────────────────────────────────────
export interface AppNotification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
}
