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

// Custom base query with automatic refresh on 401
const baseQueryWithCredentials = fetchBaseQuery({
  baseUrl: "",
  credentials: "include",
  prepareHeaders: (headers) => {
    headers.set("Accept", "application/json");
    return headers;
  },
});

/**
 * Base query wrapper that:
 * 1. Lazily sets the baseUrl from env config
 * 2. Automatically attempts token refresh on 401
 * 3. Retries the original request after successful refresh
 * 4. Forces logout if refresh fails
 */
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Lazily inject the base URL
  const config = getConfig();
  const adjustedArgs =
    typeof args === "string"
      ? args
      : { ...args, url: args.url.startsWith("http") ? args.url : args.url };

  const baseQuery = fetchBaseQuery({
    baseUrl: config.API_URL,
    credentials: "include",
    prepareHeaders: (headers) => {
      headers.set("Accept", "application/json");
      return headers;
    },
  });

  let result = await baseQuery(adjustedArgs, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Attempt token refresh
    const refreshResult = await baseQueryWithCredentials(
      { url: `${config.API_URL}/auth/refresh`, method: "POST" },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      // Retry original request
      result = await baseQuery(adjustedArgs, api, extraOptions);
    } else {
      // Refresh failed — dispatch logout
      api.dispatch({ type: "auth/forceLogout" });
    }
  }

  return result;
};

/**
 * Base API for RTK Query
 * All feature APIs should inject endpoints into this
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Auth", "User"],
  endpoints: () => ({}),
});
