import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { categoryApi } from './categoryApi'

export const categoriesAdapter = createEntityAdapter({
  selectId: (category) => category.id,
  sortComparer: (a, b) => a.name.localeCompare(b.name),
})

const initialState = categoriesAdapter.getInitialState({
  selectedCategoryId: null,
})

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setSelectedCategoryId: (state, action) => {
      state.selectedCategoryId = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      categoryApi.endpoints.getCategories.matchFulfilled,
      (state, action) => {
        categoriesAdapter.setAll(state, action.payload)
      }
    )
  },
})

export const { setSelectedCategoryId } = categorySlice.actions

export const {
  selectAll: selectAllCategories,
  selectById: selectCategoryById,
  selectIds: selectCategoryIds,
} = categoriesAdapter.getSelectors((state) => state.categories)

export const selectSelectedCategoryId = (state) =>
  state.categories.selectedCategoryId

export default categorySlice.reducer
