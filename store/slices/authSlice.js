import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Import actions from authReducer to avoid circular dependency
import { setCredentials, clearCredentials } from "./authReducer";
import Constants from "expo-constants";

const baseQuery = fetchBaseQuery({
  baseUrl: Constants.expoConfig.extra.MEMOREASEBACKEND_ENDPOINT,
  prepareHeaders: async (headers) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Accept", "application/json");
      headers.set("Content-Type", "application/json");
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
  tagTypes: ["User", "Auth"],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: `/login`,
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data?.token) {
            await AsyncStorage.setItem("token", data.token);
            await AsyncStorage.setItem("user", JSON.stringify(data.data));
            dispatch(setCredentials({ user: data.data, token: data.token }));
            console.error("Login failesssd:", data.token);
          }
        } catch (error) {
          console.error("Login failed:", error);
        }
      },
      invalidatesTags: ["Auth"],
    }),

    register: builder.mutation({
      query: (userData) => ({
        url: `/register`,
        method: "POST",
        body: userData,
      }),
    }),

    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error("Logout API failed:", error);
        } finally {
          // Always clear local storage and state
          try {
            await AsyncStorage.multiRemove(["token", "user"]);
          } catch (storageError) {
            console.error("Error clearing AsyncStorage:", storageError);
          }
          dispatch(clearCredentials());
        }
      },
      invalidatesTags: ["Auth", "User"],
    }),

    changePassword: builder.mutation({
      query: (body) => ({
        url: `/changepassword`,
        method: "PATCH",
        body: body,
      }),
      invalidatesTags: ["Auth"],
    }),

    getCurrentUser: builder.query({
      query: () => "/me",
      providesTags: ["User"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useChangePasswordMutation,
  useGetCurrentUserQuery,
} = apiSlice;
