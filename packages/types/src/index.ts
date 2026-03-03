/**
 * @snackro/types - Shared type definitions
 * Platform-agnostic types for the entire SNACKRO ecosystem
 */

// ─── Auth Types ───────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  daily_protein_target: number;
  preferences: Record<string, string | number | boolean>;
  created_at: string;
  updated_at: string;
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
  access_token: string;
  token_type: string;
}

// API Request/Response types matching OpenAPI spec
export interface FetchTokenRequest {
  id_token: string;
}

export interface FetchTokenResponse {
  access_token: string;
  token_type: string;
  user: Record<string, any>;
}

export interface LoginRequest {
  id_token: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: Record<string, any>;
}

export interface RefreshResponse {
  csrf_token: string;
}

export interface AuthMeResponse {
  user: User;
}

export interface UpdateProfileRequest {
  full_name: string;
  daily_protein_target: number;
  preferences?: Record<string, string | number | boolean>;
}

// ─── API Types ────────────────────────────────────────────────
export interface ApiError {
  status: number;
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

// Response wrapper matching OpenAPI spec
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta | null;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
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
