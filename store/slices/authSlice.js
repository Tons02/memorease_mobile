import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.MEMOREASEBACKEND_ENDPOINT, // Use process.env for React Native
  prepareHeaders: async (headers) => {
    try {
      // Get the authorization token from AsyncStorage
      const token = await AsyncStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Accept", "application/json");
      return headers;
    } catch (error) {
      console.error("Error getting token from AsyncStorage:", error);
      return headers;
    }
  },
});

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery,
  endpoints: (builder) => ({
    // Login endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: `/login`,
        method: "POST",
        body: credentials,
      }),
      // Handle token storage after successful login
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.token) {
            await AsyncStorage.setItem("token", data.token);
            // You can also store user data if returned
            if (data?.user) {
              await AsyncStorage.setItem("user", JSON.stringify(data.user));
            }
          }
        } catch (error) {
          console.error("Login failed:", error);
        }
      },
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      // Clear token from AsyncStorage after logout
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          await queryFulfilled;
          await AsyncStorage.removeItem("token");
        } catch (error) {
          // Even if the API call fails, we should clear the local token
          await AsyncStorage.removeItem("token");
        }
      },
    }),
    changePassword: builder.mutation({
      query: (body) => ({
        url: `/changepassword`,
        method: "PATCH",
        body: body,
      }),
    }),
  }),
});

// Export the generated hooks
export const {
  useLoginMutation,
  useLogoutMutation,
  useChangePasswordMutation,
} = apiSlice;
