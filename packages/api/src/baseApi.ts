/**
 * RTK Query base API — all server communication goes through here
 */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { getConfig } from "@snackro/config/env";
import { getAccessToken } from "./axios";

/**
 * Base query wrapper with:
 * 1. Lazy baseUrl injection from env config
 * 2. Automatic Authorization header injection
 * 3. Automatic API response unwrapping
 * 4. Forces logout on 401
 */
const baseQueryWithAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const config = getConfig();
  const token = getAccessToken();

  const baseQuery = fetchBaseQuery({
    baseUrl: config.API_URL,
    prepareHeaders: (headers) => {
      headers.set("Accept", "application/json");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  });

  let result = await baseQuery(args, api, extraOptions);

  // Unwrap API response if wrapped with { success, data }
  if (result.data && typeof result.data === 'object' && 'success' in result.data && 'data' in result.data) {
    result.data = (result.data as any).data;
  }

  // Handle 401 - force logout
  if (result.error && result.error.status === 401) {
    api.dispatch({ type: "auth/forceLogout" });
  }

  return result;
};

/**
 * Base API for RTK Query
 * All feature APIs should inject endpoints into this
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Auth", "User", "Dashboard", "FoodLog"],
  endpoints: () => ({}),
});
