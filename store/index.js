import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./slices/authSlice";
import authReducer from "./slices/authReducer";

const store = configureStore({
  reducer: {
    // API slice for RTK Query
    [apiSlice.reducerPath]: apiSlice.reducer,
    // Auth state management
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [apiSlice.util.resetApiState.type],
      },
    }).concat(apiSlice.middleware),
});

export default store;
