import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../../config/axiosinstance";

export const loginUser = createAsyncThunk(
  "auth/login",

  async (credentials, thunkApi) => {
    try {
      const response = await axiosInstance.post("/auth/login", credentials);
      return response.data;


    } 
    catch (error)
     {
      return thunkApi.rejectWithValue(
        error.response?.data || {
          message: "Login failed",
        },
      );
    }
  },
);
