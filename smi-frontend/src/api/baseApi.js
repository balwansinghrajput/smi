import { createApi } from '@reduxjs/toolkit/query/react'
import { apiClient } from './http'

const axiosBaseQuery =
  () =>
  async (args, api) => {
    const { url, method = 'GET', data, params } =
      typeof args === 'string' ? { url: args } : args || {}

    try {
      const result = await apiClient({ url, method, data, params })
      return { data: result.data }
    } catch (error) {
      const err = error.response

      if (err?.status === 401) {
        if (localStorage.getItem('smi_auth')) {
          api.dispatch({ type: 'auth/logout' })
          api.dispatch({
            type: 'ui/showToast',
            payload: { type: 'error', message: 'Session expired. Please log in again.' },
          })
        }
      }

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
