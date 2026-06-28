import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createProductRequest, deleteProductRequest, fetchProductsRequest, setSelectedProduct } from '../features/products/productsSlice';

function ProductsPage() {
  const dispatch = useDispatch();
  const { items: products, loading } = useSelector((state) => state.products);
  const [form, setForm] = useState({
    product_title: '',
    sub_title: '',
    category: '',
    product_description: '',
    price: '',
    stock: '',
    status: 'active',
    tags: '',
    product_image: null,
  });

  useEffect(() => {
    dispatch(fetchProductsRequest());
  }, [dispatch]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      product_image: form.product_image,
    };
    dispatch(createProductRequest(payload));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">Inventory</p>
            <h1 className="text-3xl font-semibold">Products</h1>
          </div>
          <a href="/dashboard" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm">Back to dashboard</a>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-xl font-semibold">Product list</h2>
            <div className="mt-4 space-y-3">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between rounded-xl border border-zinc-800 p-4">
                  <div>
                    <p className="font-medium">{product.product_title}</p>
                    <p className="text-sm text-zinc-400">{product.category} • {product.status}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => dispatch(setSelectedProduct(product))} className="rounded-lg border border-zinc-700 px-3 py-2 text-sm">View</button>
                    <button onClick={() => dispatch(deleteProductRequest(product.id))} className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-zinc-950">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-xl font-semibold">Create product</h2>
            <div className="mt-4 space-y-3">
              <input className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2" placeholder="Title" value={form.product_title} onChange={(event) => setForm({ ...form, product_title: event.target.value })} required />
              <input className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2" placeholder="Subtitle" value={form.sub_title} onChange={(event) => setForm({ ...form, sub_title: event.target.value })} required />
              <input className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2" placeholder="Category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required />
              <textarea className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2" placeholder="Description" value={form.product_description} onChange={(event) => setForm({ ...form, product_description: event.target.value })} required />
              <input type="number" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2" placeholder="Price" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required />
              <input type="number" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2" placeholder="Stock" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} required />
              <input className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2" placeholder="Tags (comma separated)" value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} />
              <input type="file" accept="image/*" onChange={(event) => setForm({ ...form, product_image: event.target.files?.[0] || null })} required />
              <button type="submit" className="w-full rounded-lg bg-white px-4 py-2 font-medium text-zinc-950" disabled={loading}>Create product</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;
