import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { BaseUser } from "@/types/auth";

interface AuthState {
  user: BaseUser | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthStatus: (state, action: PayloadAction<AuthState["status"]>) => {
      state.status = action.payload;
    },
    setUser: (state, action: PayloadAction<BaseUser | null>) => {
      state.user = action.payload;
      state.status = action.payload ? "succeeded" : "idle";
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.status = "idle";
    },
  },
});

export const { setAuthStatus, setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
