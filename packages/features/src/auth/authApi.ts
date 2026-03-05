/**
 * Auth API — RTK Query endpoints for authentication and user management
 */
import { baseApi } from "@snackro/api/baseApi";
import type {
  FetchTokenResponse,
  User,
  UpdateProfileRequest,
  CreateUserRequest,
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

    /**
     * GET /api/v1/users/me?email=...
     * Requires email as query param per OpenAPI spec.
     */
    getUserProfile: builder.query<User, string>({
      query: (email) => ({
        url: "/api/v1/users/me",
        params: { email },
      }),
      providesTags: ["User"],
    }),

    /**
     * POST /api/v1/users
     * First-time profile completion — backend calculates daily_protein_target.
     */
    createUser: builder.mutation<User, CreateUserRequest>({
      query: (body) => ({
        url: "/api/v1/users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth", "User"],
    }),

    /**
     * PUT /api/v1/users/me?email=...
     */
    updateUserProfile: builder.mutation<
      User,
      { email: string; data: UpdateProfileRequest }
    >({
      query: ({ email, data }) => ({
        url: "/api/v1/users/me",
        method: "PUT",
        params: { email },
        body: data,
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
  useLazyGetUserProfileQuery,
  useCreateUserMutation,
  useUpdateUserProfileMutation,
  useLogoutMutation,
} = authApi;
