import { baseApi } from '@/api/baseApi'

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: () => '/api/categories',
      providesTags: [{ type: 'Category', id: 'LIST' }],
    }),
  }),
})

export const { useGetCategoriesQuery } = categoryApi
