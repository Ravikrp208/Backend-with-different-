import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../../config/axiosinstance";

export const loginUser = createAsyncThunk(
  "auth/loginUser",

  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/login", userData);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || {
          message: "Login failed",
        },
      );
    }
  },
);
