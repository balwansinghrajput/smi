import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCouponRequest, deleteCouponRequest, fetchCouponsRequest } from '../features/coupons/couponsSlice';

function CouponsPage() {
  const dispatch = useDispatch();
  const { items: coupons, loading } = useSelector((state) => state.coupons);
  const [form, setForm] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '0',
  });

  useEffect(() => {
    dispatch(fetchCouponsRequest());
  }, [dispatch]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      discount_value: Number(form.discount_value),
      min_order_amount: Number(form.min_order_amount)
    };
    dispatch(createCouponRequest(payload));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">Marketing</p>
            <h1 className="text-3xl font-semibold">Coupons</h1>
          </div>
          <a href="/dashboard" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800">Back to dashboard</a>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-xl font-semibold">Coupon list</h2>
            <div className="mt-4 space-y-3">
              {coupons.map((coupon) => (
                <div key={coupon.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-zinc-800 p-4">
                  <div>
                    <p className="font-mono font-bold tracking-widest text-indigo-400 uppercase">{coupon.code}</p>
                    <p className="text-sm text-zinc-400">
                      {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `$${coupon.discount_value} OFF`} 
                      {' • '}Min order: ${coupon.min_order_amount}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => dispatch(deleteCouponRequest(coupon.id))} className="rounded-lg bg-red-600/10 text-red-500 hover:bg-red-600/20 px-3 py-2 text-sm font-medium">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 h-fit">
            <h2 className="text-xl font-semibold">Create coupon</h2>
            <div className="mt-4 space-y-3">
              <input className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 focus:border-zinc-500 font-mono uppercase" placeholder="CODE" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} required />
              
              <select 
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 focus:border-zinc-500"
                value={form.discount_type}
                onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>

              <input type="number" step="0.01" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 focus:border-zinc-500" placeholder="Discount Value" value={form.discount_value} onChange={(event) => setForm({ ...form, discount_value: event.target.value })} required />
              <input type="number" step="0.01" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 focus:border-zinc-500" placeholder="Min Order Amount (0 for no min)" value={form.min_order_amount} onChange={(event) => setForm({ ...form, min_order_amount: event.target.value })} required />
              
              <button type="submit" className="w-full rounded-lg bg-white px-4 py-2 font-medium text-zinc-950 hover:bg-zinc-200" disabled={loading}>Create coupon</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CouponsPage;
