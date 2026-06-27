import { baseApi } from '@/api/baseApi'

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        data: credentials,
      }),
      invalidatesTags: ['Auth', 'Cart'],
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/register',
        method: 'POST',
        data: userData,
      }),
      invalidatesTags: ['Auth', 'Cart'],
    }),
  }),
})

export const { useLoginMutation, useRegisterMutation } = authApi
