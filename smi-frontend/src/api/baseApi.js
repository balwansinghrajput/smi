import { createApi } from '@reduxjs/toolkit/query/react'
import { apiClient } from './http'

const axiosBaseQuery =
  () =>
  async ({ url, method = 'GET', data, params }) => {
    try {
      const result = await apiClient({ url, method, data, params })
      return { data: result.data }
    } catch (error) {
      const err = error.response
      return {
        error: {
          status: err?.status || 500,
          data: err?.data || { message: 'Something went wrong' },
        },
      }
    }
  }

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Product', 'Category', 'Cart', 'Auth', 'Review', 'Order'],
  endpoints: () => ({}),
})
