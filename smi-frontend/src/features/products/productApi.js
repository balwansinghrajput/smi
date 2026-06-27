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
      query: (productId) => ({ url: `/api/products/${productId}` }),
      providesTags: (result, error, productId) => [{ type: 'Product', id: productId }],
    }),
    getRelatedProducts: builder.query({
      query: (productId) => ({ url: `/api/products/${productId}/related` }),
      providesTags: (result, error, productId) => [{ type: 'Product', id: `${productId}-RELATED` }],
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
