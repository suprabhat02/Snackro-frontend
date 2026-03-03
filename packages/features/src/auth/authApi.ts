/**
 * Auth API — RTK Query endpoints for authentication
 */
import { baseApi } from "@snackro/api/baseApi";
import type {
  FetchTokenResponse,
  User,
  UpdateProfileRequest,
} from "@snackro/auth-core";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    fetchToken: builder.mutation<FetchTokenResponse, { id_token: string }>({
      query: (body) => ({
        url: "/api/v1/auth/fetch/token",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),

    checkUser: builder.query<{ authenticated: boolean; user?: User }, void>({
      query: () => "/api/v1/auth/check-user",
      providesTags: ["Auth"],
    }),

    getUserProfile: builder.query<User, void>({
      query: () => "/api/v1/users/me",
      providesTags: ["User"],
    }),

    updateUserProfile: builder.mutation<User, UpdateProfileRequest>({
      query: (body) => ({
        url: "/api/v1/users/me",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/api/v1/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth", "User"],
    }),
  }),
});

export const {
  useFetchTokenMutation,
  useCheckUserQuery,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useLogoutMutation,
} = authApi;
