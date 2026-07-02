import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchDashboardRequest } from '../features/dashboard/dashboardSlice';
import { logout } from '../features/auth/authSlice';

function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { data, loading } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardRequest());
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
        
        {loading ? (
          <p className="text-zinc-400">Loading dashboard data...</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 cursor-pointer hover:bg-zinc-800" onClick={() => navigate('/users')}>
              <p className="text-sm text-zinc-400">Total Users</p>
              <p className="mt-2 text-3xl font-semibold">{data?.total_users || 0}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 cursor-pointer hover:bg-zinc-800" onClick={() => navigate('/orders')}>
              <p className="text-sm text-zinc-400">Total Orders</p>
              <p className="mt-2 text-3xl font-semibold">{data?.total_orders || 0}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 cursor-pointer hover:bg-zinc-800" onClick={() => navigate('/products')}>
              <p className="text-sm text-zinc-400">Products</p>
              <p className="mt-2 text-3xl font-semibold">{data?.total_products || 0}</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <p className="text-sm text-zinc-400">Revenue</p>
              <p className="mt-2 text-3xl font-semibold">${(data?.total_revenue || 0).toFixed(2)}</p>
            </div>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => navigate('/categories')} className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm hover:bg-zinc-800">Categories</button>
            <button onClick={() => navigate('/brands')} className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm hover:bg-zinc-800">Brands</button>
            <button onClick={() => navigate('/reviews')} className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm hover:bg-zinc-800">Reviews</button>
            <button onClick={() => navigate('/coupons')} className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm hover:bg-zinc-800">Coupons</button>
            <button onClick={() => navigate('/settings')} className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm hover:bg-zinc-800">Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
