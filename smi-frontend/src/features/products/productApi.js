import { baseApi } from '@/api/baseApi'

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: (params) => ({
        url: '/api/products',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.products.map(({ id }) => ({ type: 'Product', id })),
              { type: 'Product', id: 'LIST' },
            ]
          : [{ type: 'Product', id: 'LIST' }],
    }),
    searchProducts: builder.query({
      query: (params) => ({
        url: '/api/products/search',
        params,
      }),
      providesTags: [{ type: 'Product', id: 'SEARCH' }],
    }),
    getProductById: builder.query({
      query: (id) => `/api/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    getRelatedProducts: builder.query({
      query: (id) => `/api/products/${id}/related`,
      providesTags: (result, error, id) => [{ type: 'Product', id: `${id}-RELATED` }],
    }),
  }),
})

export const {
  useGetProductsQuery,
  useSearchProductsQuery,
  useGetProductByIdQuery,
  useGetRelatedProductsQuery,
  useLazyGetProductsQuery,
} = productApi
