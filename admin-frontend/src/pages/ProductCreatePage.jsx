import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createProductRequest } from '../features/products/productsSlice';

function ProductCreatePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.products);
  
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

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      product_image: form.product_image,
    };
    dispatch(createProductRequest(payload));
    navigate('/products');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">Inventory</p>
            <h1 className="text-3xl font-semibold">Create New Product</h1>
          </div>
          <button onClick={() => navigate('/products')} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800 transition-colors">Back to Products</button>
        </div>
        
        <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
          {error && <div className="mb-4 rounded-lg bg-red-500/10 p-4 text-sm text-red-500">{error}</div>}
          
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-400">Title</label>
              <input className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none" placeholder="e.g. Classic White T-Shirt" value={form.product_title} onChange={(event) => setForm({ ...form, product_title: event.target.value })} required />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-400">Subtitle</label>
              <input className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none" placeholder="Brief tagline or material info" value={form.sub_title} onChange={(event) => setForm({ ...form, sub_title: event.target.value })} required />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-400">Category</label>
                <input className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none" placeholder="e.g. Clothing" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-400">Status</label>
                <select className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archive">Archive</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-400">Description</label>
              <textarea className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none min-h-[120px]" placeholder="Detailed product description..." value={form.product_description} onChange={(event) => setForm({ ...form, product_description: event.target.value })} required />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-400">Price ($)</label>
                <input type="number" step="0.01" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none" placeholder="0.00" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-400">Initial Stock</label>
                <input type="number" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none" placeholder="0" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} required />
              </div>
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-400">Tags</label>
              <input className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none" placeholder="comma, separated, tags" value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-400">Product Image</label>
              <div className="w-full rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-800/50 p-6 text-center hover:border-indigo-500/50 transition-colors">
                <input type="file" accept="image/*" className="mx-auto block w-full text-sm text-zinc-400 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-700 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-zinc-200 hover:file:bg-zinc-600 cursor-pointer" onChange={(event) => setForm({ ...form, product_image: event.target.files?.[0] || null })} required />
              </div>
            </div>
            
            <div className="pt-4 border-t border-zinc-800">
              <button type="submit" className="w-full sm:w-auto sm:float-right rounded-lg bg-indigo-500 px-8 py-3 font-medium text-white hover:bg-indigo-600 transition-colors" disabled={loading}>
                {loading ? 'Creating...' : 'Create Product'}
              </button>
              <div className="clear-both"></div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductCreatePage;
