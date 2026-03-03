/**
 * Auth API — RTK Query endpoints for authentication
 */
import { baseApi } from "@snackro/api/baseApi";
import type { LoginResponse, AuthMeResponse } from "@snackro/auth-core";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    loginWithGoogle: builder.mutation<LoginResponse, { idToken: string }>({
      query: (body) => ({
        url: "/auth/google",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),

    getMe: builder.query<AuthMeResponse, void>({
      query: () => "/auth/me",
      providesTags: ["Auth"],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth", "User"],
    }),
  }),
});

export const { useLoginWithGoogleMutation, useGetMeQuery, useLogoutMutation } =
  authApi;
