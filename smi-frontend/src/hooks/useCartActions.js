import { useCallback } from 'react'
import { useAppDispatch } from './redux'
import { showToast } from '@/features/ui/uiSlice'
import { useAddToCartMutation } from '@/features/cart/cartApi'
import { useAppSelector } from './redux'
import { selectIsAuthenticated } from '@/features/auth/authSlice'

export const useCartActions = () => {
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const [addToCartApi] = useAddToCartMutation()

  const addToCart = useCallback(
    async (productId, quantity = 1) => {
      if (!isAuthenticated) {
        dispatch(showToast({ type: 'error', message: 'Please sign in to add products to cart' }))
        return false
      }

      try {
        await addToCartApi({ productId, quantity }).unwrap()
        dispatch(showToast({ type: 'success', message: 'Product added to cart' }))
        return true
      } catch (err) {
        dispatch(showToast({ type: 'error', message: err.data?.message || 'Unable to add product' }))
        return false
      }
    },
    [dispatch, isAuthenticated, addToCartApi]
  )

  return { addToCart }
}
