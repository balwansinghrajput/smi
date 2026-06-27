export const COMPANY = {
  name: 'Shri Shyam Enterprises',
  tagline: 'Powering Your Journey with Premium Batteries',
  description:
    'Trusted manufacturer and seller of bike batteries, scooter batteries, inverter batteries, and auto parts batteries. Serving individual customers, dealers, and retail shops across India.',
  phone: '+91 98765 43210',
  email: 'info@shriyshyamenterprises.com',
  address: 'Industrial Area, Phase 2, New Delhi, India',
  hours: 'Mon - Sat: 9:00 AM - 7:00 PM',
}

export const SOCIAL_LINKS = [
  { name: 'Facebook', href: 'https://facebook.com', icon: 'facebook' },
  { name: 'Instagram', href: 'https://instagram.com', icon: 'instagram' },
  { name: 'WhatsApp', href: 'https://wa.me/919876543210', icon: 'whatsapp' },
  { name: 'YouTube', href: 'https://youtube.com', icon: 'youtube' },
]

export const FOOTER_LINKS = {
  shop: [
    { label: 'All Products', to: '/products' },
    { label: 'Bike Batteries', to: '/products?category=bike-batteries' },
    { label: 'Scooter Batteries', to: '/products?category=scooter-batteries' },
    { label: 'Inverter Batteries', to: '/products?category=inverter-batteries' },
  ],
  company: [
    { label: 'About Us', to: '/#why-us' },
    { label: 'Contact', to: '/#contact' },
    { label: 'Dealer Network', to: '/#why-us' },
    { label: 'Warranty', to: '/products' },
  ],
}

export const WHY_CHOOSE_US = [
  {
    id: 'long-life',
    title: 'Long Life Batteries',
    description: 'Engineered for extended performance with advanced plate technology.',
    icon: 'battery',
  },
  {
    id: 'fast-charging',
    title: 'Fast Charging',
    description: 'Quick recharge cycles to keep you on the road without delays.',
    icon: 'bolt',
  },
  {
    id: 'warranty',
    title: 'Warranty Support',
    description: 'Comprehensive warranty coverage with hassle-free claim support.',
    icon: 'shield',
  },
  {
    id: 'manufacturer',
    title: 'Trusted Manufacturer',
    description: 'ISO-certified manufacturing with strict quality control standards.',
    icon: 'factory',
  },
  {
    id: 'dealer-network',
    title: 'Dealer Network',
    description: 'Wide dealer and retail network for easy availability nationwide.',
    icon: 'network',
  },
]

export const SORT_OPTIONS = [
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'best-selling', label: 'Best Selling' },
]

export const TAX_RATE = 0.18
export const SHIPPING_FLAT = 99
export const FREE_SHIPPING_THRESHOLD = 2000
export const PRODUCTS_PER_PAGE = 8

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
