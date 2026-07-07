import { baseApi } from '@/api/baseApi'

export const shippingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShippingMethods: builder.query({
      query: () => '/shipping/methods',
    }),
  }),
});

export const { useGetShippingMethodsQuery } = shippingApi;
