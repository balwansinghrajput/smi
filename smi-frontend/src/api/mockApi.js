import axios from 'axios'
import { categories, products, productReviews } from '@/constants/mockData'
import { delay, getStorageItem, setStorageItem } from '@/utils'

const AUTH_KEY = 'smi_auth'
const CART_KEY = 'smi_cart'
const USERS_KEY = 'smi_users'

const getUsers = () => getStorageItem(USERS_KEY, [])

const saveUsers = (users) => setStorageItem(USERS_KEY, users)

const getCart = () => getStorageItem(CART_KEY, [])

const saveCart = (cart) => setStorageItem(CART_KEY, cart)

export const mockApi = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

mockApi.interceptors.request.use(async (config) => {
  await delay(300)
  return config
})

mockApi.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
)

export const mockRequest = async ({ url, method = 'GET', data, params }) => {
  const auth = getStorageItem(AUTH_KEY)

  if (url === '/products' && method === 'GET') {
    let result = [...products]

    if (params?.category) {
      result = result.filter((p) => p.categoryId === params.category)
    }

    if (params?.featured) {
      result = result.filter((p) => p.isFeatured)
    }

    if (params?.search) {
      const search = params.search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search)
      )
    }

    return { data: result }
  }

  if (url.startsWith('/products/') && method === 'GET') {
    const id = url.split('/')[2]
    const product = products.find((p) => p.id === id)

    if (!product) {
      throw { response: { status: 404, data: { message: 'Product not found' } } }
    }

    return {
      data: {
        ...product,
        reviews: productReviews[id] || [],
      },
    }
  }

  if (url === '/categories' && method === 'GET') {
    return { data: categories }
  }

  if (url === '/login' && method === 'POST') {
    const users = getUsers()
    const user = users.find(
      (u) => u.email === data.email && u.password === data.password
    )

    if (!user) {
      throw { response: { status: 401, data: { message: 'Invalid email or password' } } }
    }

    const { password: _, ...safeUser } = user
    const token = `token_${user.id}_${Date.now()}`
    const authData = { user: safeUser, token }
    setStorageItem(AUTH_KEY, authData)

    return { data: authData }
  }

  if (url === '/register' && method === 'POST') {
    const users = getUsers()

    if (users.some((u) => u.email === data.email)) {
      throw { response: { status: 409, data: { message: 'Email already registered' } } }
    }

    const newUser = {
      id: `user_${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
    }

    saveUsers([...users, newUser])

    const { password: _, ...safeUser } = newUser
    const token = `token_${newUser.id}_${Date.now()}`
    const authData = { user: safeUser, token }
    setStorageItem(AUTH_KEY, authData)

    return { data: authData }
  }

  if (url === '/cart' && method === 'GET') {
    if (!auth?.token) {
      throw { response: { status: 401, data: { message: 'Unauthorized' } } }
    }
    return { data: getCart() }
  }

  if (url === '/cart' && method === 'POST') {
    if (!auth?.token) {
      throw { response: { status: 401, data: { message: 'Unauthorized' } } }
    }

    const cart = getCart()
    const existing = cart.find((item) => item.productId === data.productId)

    if (existing) {
      existing.quantity += data.quantity || 1
    } else {
      cart.push({
        id: `cart_${Date.now()}`,
        productId: data.productId,
        quantity: data.quantity || 1,
      })
    }

    saveCart(cart)
    return { data: cart }
  }

  if (url.startsWith('/cart/') && method === 'DELETE') {
    if (!auth?.token) {
      throw { response: { status: 401, data: { message: 'Unauthorized' } } }
    }

    const itemId = url.split('/')[2]
    const cart = getCart().filter((item) => item.id !== itemId)
    saveCart(cart)
    return { data: cart }
  }

  throw { response: { status: 404, data: { message: 'Not found' } } }
}

export const axiosBaseQuery =
  () =>
  async ({ url, method, data, params }) => {
    try {
      const result = await mockRequest({ url, method, data, params })
      return { data: result.data }
    } catch (error) {
      const err = error.response || error
      return {
        error: {
          status: err.status || 500,
          data: err.data || { message: 'Something went wrong' },
        },
      }
    }
  }
