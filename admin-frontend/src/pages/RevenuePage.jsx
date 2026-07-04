import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchProductRevenueRequest } from '../features/revenue/revenueSlice';

function RevenuePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productsRevenue, loading } = useSelector((state) => state.revenue);

  useEffect(() => {
    dispatch(fetchProductRevenueRequest());
  }, [dispatch]);

  const totalOverallRevenue = productsRevenue.reduce((acc, curr) => acc + curr.revenue, 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">Analytics</p>
            <h1 className="text-3xl font-semibold">Product Revenue</h1>
          </div>
          <button onClick={() => navigate('/dashboard')} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-center hover:bg-zinc-800 transition-colors">Back to dashboard</button>
        </div>

        <div className="mb-8 rounded-2xl border border-zinc-800 bg-gradient-to-br from-indigo-900/40 to-zinc-900 p-6 sm:p-8">
          <p className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Total Sales Revenue</p>
          <p className="mt-2 text-4xl sm:text-5xl font-bold text-white">${totalOverallRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold mb-6">Revenue by Product</h2>
          
          {loading ? (
             <div className="py-12 text-center text-zinc-500">Loading revenue data...</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {productsRevenue.map((product) => (
                <div key={product.product_id} className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-950/50 p-5 hover:border-zinc-700 transition-colors shadow-sm">
                  
                  <div className="flex gap-4">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-800 border border-zinc-700">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.product_title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">No Img</div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center overflow-hidden w-full">
                      <p className="truncate font-semibold text-zinc-100 text-lg">{product.product_title}</p>
                      <p className="text-xs text-indigo-400 font-medium tracking-wide uppercase mb-1">{product.category}</p>
                    </div>
                  </div>
                  
                  <div className="mt-5 grid grid-cols-2 gap-4 border-t border-zinc-800 pt-4">
                    <div>
                      <p className="text-xs text-zinc-500 uppercase font-medium">Units Sold</p>
                      <p className="text-xl font-semibold text-zinc-200">{product.units_sold}</p>
                    </div>
                    <div>
                      <p className="text-xs text-emerald-500/70 uppercase font-medium">Revenue</p>
                      <p className="text-xl font-bold text-emerald-400">${product.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                  
                </div>
              ))}
              
              {productsRevenue.length === 0 && (
                <div className="col-span-full py-12 text-center text-zinc-500">
                  <p>No completed orders found to calculate revenue.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RevenuePage;
