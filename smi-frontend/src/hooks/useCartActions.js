import { useCallback } from 'react'
import { useAppDispatch } from './redux'
import { addToCartLocal } from '@/features/cart/cartSlice'
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
      dispatch(addToCartLocal({ productId, quantity }))
      dispatch(
        showToast({ type: 'success', message: 'Product added to cart' })
      )

      if (isAuthenticated) {
        try {
          await addToCartApi({ productId, quantity }).unwrap()
        } catch {
          // Local cart still works for guests
        }
      }
    },
    [dispatch, isAuthenticated, addToCartApi]
  )

  return { addToCart }
}
