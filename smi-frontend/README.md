# Shri Shyam Enterprises - E-Commerce Frontend

Premium battery e-commerce frontend built with React 19, Vite, Tailwind CSS, Redux Toolkit, RTK Query, and React Router.

## Tech Stack

- React 19 + Vite 7
- Tailwind CSS 4
- Redux Toolkit + RTK Query + Entity Adapter
- React Router DOM 7
- Axios (mock API layer)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── app/           # Redux store
├── api/           # RTK Query base API + mock layer
├── features/      # Redux slices & API endpoints
├── pages/         # Route pages
├── components/    # Reusable UI components
├── layouts/       # Page layouts
├── routes/        # React Router config
├── hooks/         # Custom hooks
├── utils/         # Helpers
└── constants/     # App constants & mock data
```

## Features

- Premium black industrial theme
- Homepage with hero video, categories, featured products, testimonials
- Product listing with search, filters, sort, pagination
- Product details with specs, reviews, similar products
- Cart with tax & shipping calculation
- Login/Register with validation
- Lazy-loaded routes & code splitting
- Skeleton loaders & error boundaries
- Mobile-first responsive design

## Mock API

The app uses a local mock API layer (`src/api/mockApi.js`) with localStorage persistence for auth and cart. Connect a real backend by updating `VITE_API_BASE_URL` and replacing the mock base query.

## Assets

Product and hero images/videos are loaded from the `assets/` folder at project root.
