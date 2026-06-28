import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProductsRequest } from '../features/products/productsSlice';
import { fetchAdminsRequest } from '../features/admins/adminsSlice';
import { logout } from '../features/auth/authSlice';

function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { items: products } = useSelector((state) => state.products);
  const { items: admins } = useSelector((state) => state.admins);

  useEffect(() => {
    dispatch(fetchProductsRequest());
    dispatch(fetchAdminsRequest());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">Overview</p>
            <h1 className="mt-2 text-3xl font-semibold">Admin dashboard</h1>
            <p className="mt-2 text-sm text-zinc-400">Welcome back, {user?.email || 'admin'}.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/products')} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm">Products</button>
            <button onClick={() => dispatch(logout())} className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950">Logout</button>
          </div>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-400">Products</p>
            <p className="mt-2 text-3xl font-semibold">{products.length}</p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-400">Admins</p>
            <p className="mt-2 text-3xl font-semibold">{admins.length}</p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm text-zinc-400">Status</p>
            <p className="mt-2 text-3xl font-semibold">Online</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
