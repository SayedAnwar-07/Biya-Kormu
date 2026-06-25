import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api, { normalizeErrors } from "@/lib/axiosInstance";

// Create Order
export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async ({ buyerSlug, payload }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await api.post(
        `/users/${buyerSlug}/orders/create/`,
        payload,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );
      return res.data;
    } catch (err) {
      const data = err?.response?.data ?? { detail: "Request failed" };
      return rejectWithValue(data);
    }
  }
);
// Fetch Buyer Orders
export const fetchBuyerOrders = createAsyncThunk(
  "orders/fetchBuyerOrders",
  async ({ buyerSlug }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/users/${buyerSlug}/orders/`);
      return res.data;
    } catch (err) {
      const data = err?.response?.data ?? { detail: "Request failed" };
      return rejectWithValue(normalizeErrors ? normalizeErrors(data) : data);
    }
  }
);

// Fetch Seller Orders
export const fetchSellerOrders = createAsyncThunk(
  "orders/fetchSellerOrders",
  async ({ sellerSlug }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/users/${sellerSlug}/orders/seller/`);
      return res.data;
    } catch (err) {
      const data = err?.response?.data ?? { detail: "Request failed" };
      return rejectWithValue(normalizeErrors ? normalizeErrors(data) : data);
    }
  }
);

// Accept Order (Seller)
export const acceptOrder = createAsyncThunk(
  "orders/acceptOrder",
  async (
    { sellerSlug, orderId, payload = { seller_agreed: true } },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.patch(
        `/users/${sellerSlug}/orders/${orderId}/accept/`,
        payload
      );
      return res.data;
    } catch (error) {
      console.error(
        "Accept order error:",
        error.response?.data || error.message
      );
      return rejectWithValue(error.response?.data);
    }
  }
);

// Update Order (Buyer)
export const updateOrder = createAsyncThunk(
  "orders/updateOrder",
  async ({ buyerSlug, orderId, payload }, { rejectWithValue }) => {
    try {
      const res = await api.patch(
        `/users/${buyerSlug}/orders/${orderId}/update/`,
        payload
      );
      return res.data;
    } catch (error) {
      console.error(
        "Accept order error:",
        error.response?.data || error.message
      );
      return rejectWithValue(error.response?.data);
    }
  }
);

// Delete / Cancel Order
export const deleteOrder = createAsyncThunk(
  "orders/deleteOrder",
  async ({ buyerSlug, orderId }, { rejectWithValue }) => {
    try {
      const res = await api.delete(
        `/users/${buyerSlug}/orders/${orderId}/delete/`
      );
      return { orderId, data: res.data };
    } catch (err) {
      const data = err?.response?.data ?? { detail: "Request failed" };
      return rejectWithValue(normalizeErrors ? normalizeErrors(data) : data);
    }
  }
);

// Seller Update Order
export const sellerUpdateOrder = createAsyncThunk(
  "orders/sellerUpdateOrder",
  async ({ sellerSlug, orderId, payload }, { rejectWithValue }) => {
    try {
      const res = await api.patch(
        `/users/${sellerSlug}/orders/${orderId}/seller-update/`,
        payload
      );
      return res.data;
    } catch (error) {
      console.error("Update order error:", error.globalErrors[0]);
      return rejectWithValue(error.globalErrors[0]);
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    buyerOrders: [],
    sellerOrders: [],
    currentOrder: null,
    loading: false,
    error: null,
    message: null,
  },
  reducers: {
    clearOrderErrors: (state) => {
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.buyerOrders.unshift(action.payload);
        state.currentOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Buyer Orders
      .addCase(fetchBuyerOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBuyerOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.buyerOrders = action.payload;
      })
      .addCase(fetchBuyerOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Seller Orders
      .addCase(fetchSellerOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSellerOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.sellerOrders = action.payload;
      })
      .addCase(fetchSellerOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Accept Order
      .addCase(acceptOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptOrder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sellerOrders.findIndex(
          (o) => o.id === action.payload.id
        );
        if (index >= 0) state.sellerOrders[index] = action.payload;
      })
      .addCase(acceptOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Order (Buyer)
      .addCase(updateOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.buyerOrders.findIndex(
          (o) => o.id === action.payload.id
        );
        if (index >= 0) state.buyerOrders[index] = action.payload;
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete / Cancel Order
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.buyerOrders = state.buyerOrders.filter(
          (o) => o.id !== action.payload.orderId
        );
        state.sellerOrders = state.sellerOrders.filter(
          (o) => o.id !== action.payload.orderId
        );
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Seller Update Order
      .addCase(sellerUpdateOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sellerUpdateOrder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.sellerOrders.findIndex(
          (o) => o.id === action.payload.id
        );
        if (index >= 0) state.sellerOrders[index] = action.payload;

        const buyerIndex = state.buyerOrders.findIndex(
          (o) => o.id === action.payload.id
        );
        if (buyerIndex >= 0) state.buyerOrders[buyerIndex] = action.payload;
      })
      .addCase(sellerUpdateOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const selectOrderError = (state) => state.order.error;

export const { clearOrderErrors, clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
