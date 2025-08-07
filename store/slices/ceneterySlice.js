import { apiSlice } from "./authSlice";

export const apiCemetery = apiSlice
  .enhanceEndpoints({
    addTagTypes: ["Cemetery"],
  })
  .injectEndpoints({
    endpoints: (builder) => ({
      getCemetery: builder.query({
        query: () => `/cemeteries?status=active&pagination=none`,
        method: "GET",
        providesTags: ["Cemetery"],
      }),
    }),
  });

export const { useGetCemeteryQuery } = apiCemetery;
