import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { productApi } from './productApi'

export const productsAdapter = createEntityAdapter({
  selectId: (product) => product.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
})

const initialState = productsAdapter.getInitialState({
  filters: {
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'best-selling',
    page: 1,
  },
  selectedProductId: null,
})

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProductFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload, page: 1 }
    },
    setProductPage: (state, action) => {
      state.filters.page = action.payload
    },
    setSelectedProductId: (state, action) => {
      state.selectedProductId = action.payload
    },
    resetProductFilters: (state) => {
      state.filters = initialState.filters
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      productApi.endpoints.getProducts.matchFulfilled,
      (state, action) => {
        productsAdapter.setAll(state, action.payload.products)
      }
    )
    builder.addMatcher(
      productApi.endpoints.getProductById.matchFulfilled,
      (state, action) => {
        productsAdapter.upsertOne(state, action.payload)
      }
    )
  },
})

export const {
  setProductFilters,
  setProductPage,
  setSelectedProductId,
  resetProductFilters,
} = productSlice.actions

export const {
  selectAll: selectAllProducts,
  selectById: selectProductById,
  selectIds: selectProductIds,
  selectEntities: selectProductEntities,
} = productsAdapter.getSelectors((state) => state.products)

export const selectProductFilters = (state) => state.products.filters
export const selectSelectedProductId = (state) => state.products.selectedProductId

export default productSlice.reducer
