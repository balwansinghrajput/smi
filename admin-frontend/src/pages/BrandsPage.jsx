import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createBrandRequest, deleteBrandRequest, fetchBrandsRequest } from '../features/brands/brandsSlice';

function BrandsPage() {
  const dispatch = useDispatch();
  const { items: brands, loading } = useSelector((state) => state.brands);
  const [form, setForm] = useState({
    name: '',
    description: '',
    brand_image: null,
  });

  useEffect(() => {
    dispatch(fetchBrandsRequest());
  }, [dispatch]);

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(createBrandRequest(form));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">Inventory</p>
            <h1 className="text-3xl font-semibold">Brands</h1>
          </div>
          <a href="/dashboard" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800">Back to dashboard</a>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-xl font-semibold">Brand list</h2>
            <div className="mt-4 space-y-3">
              {brands.map((brand) => (
                <div key={brand.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-zinc-800 p-4">
                  <div className="flex items-center gap-4">
                    {brand.image_url && <img src={brand.image_url} alt={brand.name} className="h-10 w-10 rounded-md object-cover" />}
                    <div>
                      <p className="font-medium">{brand.name}</p>
                      <p className="text-sm text-zinc-400">{brand.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => dispatch(deleteBrandRequest(brand.id))} className="rounded-lg bg-red-600/10 text-red-500 hover:bg-red-600/20 px-3 py-2 text-sm font-medium">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 h-fit">
            <h2 className="text-xl font-semibold">Create brand</h2>
            <div className="mt-4 space-y-3">
              <input className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 focus:border-zinc-500 focus:outline-none" placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
              <textarea className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 focus:border-zinc-500 focus:outline-none" placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
              <input type="file" accept="image/*" onChange={(event) => setForm({ ...form, brand_image: event.target.files?.[0] || null })} className="text-sm text-zinc-400" />
              <button type="submit" className="w-full rounded-lg bg-white px-4 py-2 font-medium text-zinc-950 hover:bg-zinc-200" disabled={loading}>Create brand</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BrandsPage;
