import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axiosInstance";

// register
export const registerUser = createAsyncThunk(
  "user/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post(`/users/register/`, userData);
      return response.data;
    } catch (error) {
      console.log("Register error:", error);
      return rejectWithValue(error.response?.data || error);
    }
  }
);

// login
export const loginUser = createAsyncThunk(
  "user/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post(`/users/login/`, credentials);
      if (response.data.access && response.data.refresh) {
        localStorage.setItem("accessToken", response.data.access);
        localStorage.setItem("refreshToken", response.data.refresh);
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// verify otp
export const verifyOtp = createAsyncThunk(
  "user/verifyOtp",
  async (otpData, { rejectWithValue }) => {
    try {
      const response = await api.post(`/users/verify-otp/`, otpData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// resend otp
export const resendOtp = createAsyncThunk(
  "user/resendOtp",
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post(`/users/resend-otp/`, {
        email,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// forgot password
export const forgotPassword = createAsyncThunk(
  "user/forgotPassword",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post(`/users/forgot-password/`, credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// reset password
export const resetPassword = createAsyncThunk(
  "user/resetPassword",
  async (resetData, { rejectWithValue }) => {
    try {
      const response = await api.post(`/users/reset-password/`, resetData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// profile
export const getProfile = createAsyncThunk(
  "user/getProfile",
  async (slug, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await api.get(`/users/profile/${slug}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// update profile
export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async ({ slug, userData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await api.put(`/users/profile/${slug}/edit/`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);
// whatsapp click count
// bump whatsapp click counters
export const bumpWhatsappClick = createAsyncThunk(
  "user/bumpWhatsappClick",
  async (slug, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await api.post(
        `/users/profile/${slug}/`,
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );
      return { slug, ...response.data };
    } catch (error) {
      return rejectWithValue(error?.response?.data || error);
    }
  }
);

// Check if user is authenticated from localStorage
const getInitialUserState = () => {
  const token = localStorage.getItem("accessToken");
  const userData = localStorage.getItem("userData");

  return {
    user: userData ? JSON.parse(userData) : null,
    token: token || null,
    isAuthenticated: !!token,
  };
};

const userSlice = createSlice({
  name: "user",
  initialState: {
    ...getInitialUserState(),
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userData");
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.message = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("userData", JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.access;
        state.isAuthenticated = true;
        localStorage.setItem("userData", JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.user = action.payload.user;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Resend OTP
      .addCase(resendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendOtp.fulfilled, (state) => {
        state.loading = false;
        state.message = "OTP sent successfully";
      })
      .addCase(resendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message =
          action.payload?.message ||
          "If the email exists, an OTP has been sent";
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.message = "Password reset successfully";
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
        state.user = action.payload.user;
        localStorage.setItem("userData", JSON.stringify(action.payload.user));
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // WhatsApp Click Count
      .addCase(bumpWhatsappClick.fulfilled, (state, action) => {
        const { slug, whatsapp_click_count, whatsapp_daily_click_count } =
          action.payload || {};
        if (state.user && state.user.slug === slug) {
          state.user.whatsapp_click_count =
            whatsapp_click_count ?? state.user.whatsapp_click_count;
          state.user.whatsapp_daily_click_count =
            whatsapp_daily_click_count ?? state.user.whatsapp_daily_click_count;
          localStorage.setItem("userData", JSON.stringify(state.user));
        }
      })
      .addCase(bumpWhatsappClick.rejected, (state, action) => {
        state.error = action.payload || action.error;
      });
  },
});

export const selectCurrentUser = (state) => state.user.user;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;

export const { logout, clearError, clearMessage, setUser } = userSlice.actions;
export default userSlice.reducer;
