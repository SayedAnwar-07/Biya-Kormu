import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import eventsReducer from "./slices/eventSlice";
import reviewsReducer from "./slices/reviewSlice";
import reportReducer from "./slices/reportSlice";
import ordersReducer from "./slices/orderSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    events: eventsReducer,
    reviews: reviewsReducer,
    reports: reportReducer,
     orders: ordersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export default store;
