import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    mobileMenuOpen: false,
    toast: null,
    globalLoading: false,
  },
  reducers: {
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen
    },
    closeMobileMenu: (state) => {
      state.mobileMenuOpen = false
    },
    showToast: (state, action) => {
      state.toast = action.payload
    },
    hideToast: (state) => {
      state.toast = null
    },
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload
    },
  },
})

export const {
  toggleMobileMenu,
  closeMobileMenu,
  showToast,
  hideToast,
  setGlobalLoading,
} = uiSlice.actions

export const selectMobileMenuOpen = (state) => state.ui.mobileMenuOpen
export const selectToast = (state) => state.ui.toast

export default uiSlice.reducer
