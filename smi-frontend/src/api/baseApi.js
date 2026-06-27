import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from './mockApi'

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Product', 'Category', 'Cart', 'Auth'],
  endpoints: () => ({}),
})
