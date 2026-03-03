/**
 * UI Slice — purely UI-related state (no business logic)
 */
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AppNotification } from "@snackro/types";

interface UIState {
  sidebarOpen: boolean;
  notifications: AppNotification[];
  globalLoading: boolean;
}

const initialState: UIState = {
  sidebarOpen: false,
  notifications: [],
  globalLoading: false,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    addNotification(state, action: PayloadAction<AppNotification>) {
      state.notifications.push(action.payload);
    },
    removeNotification(state, action: PayloadAction<string>) {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload,
      );
    },
    clearNotifications(state) {
      state.notifications = [];
    },
    setGlobalLoading(state, action: PayloadAction<boolean>) {
      state.globalLoading = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  addNotification,
  removeNotification,
  clearNotifications,
  setGlobalLoading,
} = uiSlice.actions;

export default uiSlice.reducer;
