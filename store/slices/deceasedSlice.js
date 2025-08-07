import { apiSlice } from "./authSlice";

export const apiDeceased = apiSlice
  .enhanceEndpoints({
    addTagTypes: ["Deceased"],
  })
  .injectEndpoints({
    endpoints: (builder) => ({
      getDeceased: builder.query({
        query: (params) => ({
          url: "/deceased",
          params,
        }),
        method: "GET",
        providesTags: ["Deceased"],
      }),
    }),
  });

export const { useGetDeceasedQuery } = apiDeceased;
