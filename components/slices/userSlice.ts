// src/store/slices/userSlice.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { LOGIN_USER_API } from '../api/apiPath';
import http from '../api/server';

// Define payload types
export interface UserCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: any;
    userId: number;
  userName: string;
  userEmail: string;
  // token: string;
  expiresAt: string;
}


// Thunk for login
export const loginUser = createAsyncThunk<LoginResponse, UserCredentials>(
  'user/loginUser',
  async (userCred, { rejectWithValue }) => {
    try {
      const response = await http.post(LOGIN_USER_API, userCred);
      const loginData = response.data as LoginResponse;

      // ✅ Store token in AsyncStorage for React Native
      await AsyncStorage.setItem('authToken', loginData.token);

      return loginData;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || 'Login failed');
    }
  }
);

// Define state type
interface UserState {
  userObj: LoginResponse | null;
   userId: string | null;
}

// Initial state
const initialState: UserState = {
  userObj: null,
    userId: "", 
};

// Slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.userObj = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.userObj = action.payload;
      })
      .addCase(loginUser.rejected, (state) => {
        state.userObj = null;
      });
  },
});

// Export actions and reducer
export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
