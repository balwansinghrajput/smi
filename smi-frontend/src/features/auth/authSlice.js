import { createSlice } from '@reduxjs/toolkit'
import { getStorageItem, setStorageItem } from '@/utils'
import { authApi } from './authApi'

const AUTH_KEY = 'smi_auth'

const loadAuth = () => getStorageItem(AUTH_KEY, { user: null, token: null })

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: loadAuth().user,
    token: loadAuth().token,
    isAuthenticated: !!loadAuth().token,
  },
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem(AUTH_KEY)
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        setStorageItem(AUTH_KEY, action.payload)
      })
      .addMatcher(authApi.endpoints.register.matchFulfilled, (state, action) => {
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        setStorageItem(AUTH_KEY, action.payload)
      })
  },
})

export const { logout } = authSlice.actions
export const selectAuth = (state) => state.auth
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectCurrentUser = (state) => state.auth.user

export default authSlice.reducer
