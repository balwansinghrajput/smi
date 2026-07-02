/**
 * Razorpay JS SDK utility helpers.
 *
 * The Razorpay checkout script is loaded on-demand (only when the user
 * actually attempts an online payment), keeping initial page load fast.
 *
 * To switch to live payments: update VITE_RAZORPAY_KEY_ID in .env
 * No other changes are required.
 */

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID

/**
 * Dynamically load the Razorpay checkout script.
 * Safe to call multiple times — only loads once.
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = RAZORPAY_SCRIPT_URL
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

/**
 * Open the Razorpay payment modal.
 *
 * @param {object} options
 * @param {string} options.razorpayOrderId   - order.payment.transactionId from backend
 * @param {number} options.amount            - amount in INR (will be converted to paise)
 * @param {string} options.currency          - default "INR"
 * @param {string} options.orderRef          - our internal order ID (for display)
 * @param {object} options.prefill           - { name, email, contact }
 * @param {string} options.description       - payment description shown in modal
 * @param {function} options.onSuccess       - called with { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * @param {function} options.onFailure       - called with error reason string
 * @param {function} options.onDismiss       - called when user closes modal without paying
 *
 * @returns {Promise<boolean>} true if script loaded successfully
 */
export async function openRazorpayModal({
  razorpayOrderId,
  amount,
  currency = 'INR',
  orderRef,
  prefill = {},
  description = 'SMI Battery Purchase',
  onSuccess,
  onFailure,
  onDismiss,
}) {
  const loaded = await loadRazorpayScript()

  if (!loaded) {
    onFailure?.('Failed to load Razorpay payment gateway. Please check your internet connection.')
    return false
  }

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: Math.round(amount * 100), // paise
    currency,
    name: 'Shri Shyam Enterprises',
    description,
    image: '/favicon.svg',           // company logo shown in modal
    order_id: razorpayOrderId,
    prefill: {
      name: prefill.name || '',
      email: prefill.email || '',
      contact: prefill.contact || '',
    },
    notes: {
      order_reference: orderRef || '',
    },
    theme: {
      color: '#F59E0B',              // accent yellow matching site theme
    },
    modal: {
      ondismiss: () => {
        onDismiss?.()
      },
    },
    handler: (response) => {
      // response contains:
      //   razorpay_order_id, razorpay_payment_id, razorpay_signature
      onSuccess?.(response)
    },
  }

  const rzp = new window.Razorpay(options)

  rzp.on('payment.failed', (response) => {
    onFailure?.(
      response.error?.description || response.error?.reason || 'Payment failed'
    )
  })

  rzp.open()
  return true
}
