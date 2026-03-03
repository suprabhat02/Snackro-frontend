/**
 * Dashboard API — RTK Query endpoints for dashboard data
 */
import { baseApi } from "@snackro/api/baseApi";

export interface DailyProgress {
  target_protein_grams: number;
  consumed_protein_grams: number;
  remaining_protein_grams: number;
}

export interface FoodLogResponse {
  id: string;
  food_name: string;
  protein_grams: number;
  quantity: number;
  unit: string;
  log_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardResponse {
  progress: DailyProgress;
  logs: FoodLogResponse[];
}

export interface FoodLogCreateRequest {
  food_name: string;
  protein_grams: number;
  quantity: number;
  unit: string;
  log_date: string;
  notes?: string | null;
}

export interface FoodLogUpdateRequest {
  food_name: string;
  protein_grams: number;
  quantity: number;
  unit: string;
  log_date: string;
  notes?: string | null;
}

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<DashboardResponse, void>({
      query: () => "/api/v1/dashboard",
      providesTags: ["Dashboard"],
    }),

    getFoodLogs: builder.query<FoodLogResponse[], { start_date?: string; end_date?: string }>({
      query: (params) => ({
        url: "/api/v1/food-logs",
        params,
      }),
      providesTags: ["FoodLog"],
    }),

    getFoodLogById: builder.query<FoodLogResponse, string>({
      query: (id) => `/api/v1/food-logs/${id}`,
      providesTags: (_result, _error, id) => [{ type: "FoodLog", id }],
    }),

    createFoodLog: builder.mutation<FoodLogResponse, FoodLogCreateRequest>({
      query: (body) => ({
        url: "/api/v1/food-logs",
        method: "POST",
        body,
      }),
      invalidatesTags: ["FoodLog", "Dashboard"],
    }),

    updateFoodLog: builder.mutation<
      FoodLogResponse,
      { id: string; data: FoodLogUpdateRequest }
    >({
      query: ({ id, data }) => ({
        url: `/api/v1/food-logs/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "FoodLog", id },
        "Dashboard",
      ],
    }),

    deleteFoodLog: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/food-logs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["FoodLog", "Dashboard"],
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetFoodLogsQuery,
  useGetFoodLogByIdQuery,
  useCreateFoodLogMutation,
  useUpdateFoodLogMutation,
  useDeleteFoodLogMutation,
} = dashboardApi;
