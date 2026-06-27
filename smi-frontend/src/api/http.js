import axios from 'axios'
import { API_BASE_URL } from '@/constants'
import { getStorageItem } from '@/utils'

const AUTH_KEY = 'smi_auth'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

apiClient.interceptors.request.use((config) => {
  const auth = getStorageItem(AUTH_KEY)
  if (auth?.token) {
    config.headers.Authorization = `Bearer ${auth.token}`
  }
  return config
})

