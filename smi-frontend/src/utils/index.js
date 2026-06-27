export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)

export const calculateDiscount = (price, originalPrice) => {
  if (!originalPrice || originalPrice <= price) return 0
  return Math.round(((originalPrice - price) / originalPrice) * 100)
}

export const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

export const validatePhone = (phone) => /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''))

export const validatePassword = (password) => password.length >= 6

export const getStorageItem = (key, fallback = null) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch {
    return fallback
  }
}

export const setStorageItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

export const removeStorageItem = (key) => {
  localStorage.removeItem(key)
}

export const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms))

export const sortProducts = (products, sortBy) => {
  const sorted = [...products]

  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price)
    case 'newest':
      return sorted.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
    case 'best-selling':
      return sorted.sort((a, b) => Number(b.isBestSelling) - Number(a.isBestSelling))
    default:
      return sorted
  }
}

export const filterProducts = (products, { search, category, minPrice, maxPrice }) => {
  return products.filter((product) => {
    const matchesSearch =
      !search ||
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase())

    const matchesCategory = !category || product.categoryId === category

    const matchesMinPrice = minPrice === '' || product.price >= Number(minPrice)
    const matchesMaxPrice = maxPrice === '' || product.price <= Number(maxPrice)

    return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice
  })
}

export const paginate = (items, page, perPage) => {
  const start = (page - 1) * perPage
  return {
    items: items.slice(start, start + perPage),
    totalPages: Math.ceil(items.length / perPage) || 1,
    totalItems: items.length,
  }
}
