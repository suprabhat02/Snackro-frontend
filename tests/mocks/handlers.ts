/**
 * MSW Handlers — Mock API handlers for testing
 */
import { http, HttpResponse } from "msw";

const API_URL = "http://localhost:3001/api";

export const mockUser = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User",
  picture: "https://lh3.googleusercontent.com/a/default-user",
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
};

export const handlers = [
  // Google login
  http.post(`${API_URL}/auth/google`, () => {
    return HttpResponse.json({
      user: mockUser,
      accessToken: "mock-access-token",
    });
  }),

  // Get current user
  http.get(`${API_URL}/auth/me`, () => {
    return HttpResponse.json({
      user: mockUser,
    });
  }),

  // Refresh
  http.post(`${API_URL}/auth/refresh`, () => {
    return HttpResponse.json({
      accessToken: "mock-refreshed-access-token",
    });
  }),

  // Logout
  http.post(`${API_URL}/auth/logout`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
