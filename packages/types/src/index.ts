/**
 * @snackro/types - Shared type definitions
 * Platform-agnostic types for the entire SNACKRO ecosystem
 */

// ─── Domain Enums ─────────────────────────────────────────────

/**
 * Lifestyle goals — maps to backend LifestyleGoal enum.
 * Order matters: ascending intensity used for display tables.
 */
export type LifestyleGoal =
  | "sedentary"
  | "lightly_active"
  | "regular_exercise"
  | "recomposition"
  | "muscle_building"
  | "aggressive_bodybuilding";

// ─── Auth Types ───────────────────────────────────────────────

/**
 * User — matches UserResponse from OpenAPI spec.
 * avatar_url is a client-side extension (from Google OAuth, not persisted).
 */
export interface User {
  id: string;
  email: string;
  full_name: string;
  /** Not in API spec — enriched client-side from Google credential */
  avatar_url?: string | null;
  daily_protein_target: number;
  weight_kg: number | null;
  height_cm: number | null;
  lifestyle: LifestyleGoal | null;
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

// Response from /api/v1/auth/fetch/token
// The 'user' object should match UserResponse from the API
export interface FetchTokenResponse {
  access_token: string;
  token_type: string;
  user: User; // Matches UserResponse from OpenAPI spec
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
  weight_kg?: number | null;
  height_cm?: number | null;
  lifestyle?: LifestyleGoal | null;
}

/**
 * Request body for POST /api/v1/users
 * Used when a new user completes their profile for the first time.
 */
export interface CreateUserRequest {
  email: string;
  full_name: string;
  weight_kg: number;
  height_cm: number;
  lifestyle: LifestyleGoal;
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
