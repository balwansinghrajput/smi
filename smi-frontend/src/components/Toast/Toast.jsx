import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { hideToast, selectToast } from '@/features/ui/uiSlice'

export default function Toast() {
  const dispatch = useAppDispatch()
  const toast = useAppSelector(selectToast)

  useEffect(() => {
    if (!toast) return

    const timer = setTimeout(() => dispatch(hideToast()), 3000)
    return () => clearTimeout(timer)
  }, [toast, dispatch])

  if (!toast) return null

  const bgColor =
    toast.type === 'error'
      ? 'bg-error'
      : toast.type === 'success'
        ? 'bg-success'
        : 'bg-accent'

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`fixed bottom-6 right-4 z-50 max-w-sm rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${bgColor}`}
    >
      {toast.message}
    </div>
  )
}
