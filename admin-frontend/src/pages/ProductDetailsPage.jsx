import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProductsRequest, updateProductRequest } from '../features/products/productsSlice';

function ProductDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: products, loading } = useSelector((state) => state.products);
  
  const [form, setForm] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProductsRequest());
    }
  }, [dispatch, products.length]);

  useEffect(() => {
    const product = products.find(p => p.id === id);
    if (product && !form) {
      setForm({
        product_title: product.product_title,
        sub_title: product.sub_title,
        category: product.category,
        product_description: product.product_description,
        price: product.price,
        stock: product.stock,
        status: product.status,
        tags: product.tags ? product.tags.join(', ') : '',
        product_image: null,
      });
      setImagePreview(product.image_url);
    }
  }, [products, id, form]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setForm({ ...form, product_image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form) return;
    
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
    };
    
    // Only send the image if a new one was selected
    if (!payload.product_image) {
      delete payload.product_image;
    }
    
    dispatch(updateProductRequest({ id, data: payload }));
  };

  if (!form) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">Loading product details...</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">Inventory</p>
            <h1 className="text-3xl font-semibold">Edit Product</h1>
          </div>
          <button onClick={() => navigate('/products')} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800 transition-colors">Back to Products</button>
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8">
          
          {/* Image & Quick Info Column */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-lg font-medium mb-4 text-zinc-200">Product Image</h2>
              <div className="w-full aspect-square rounded-xl bg-zinc-800 border border-zinc-700 overflow-hidden mb-4 relative group">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500">No Image</div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-lg font-medium text-sm hover:bg-zinc-200">
                    Change Image
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>
              </div>
              <p className="text-xs text-zinc-500 text-center">Click the image to upload a new one.</p>
            </div>
            
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-400">Status</label>
                <select className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archive">Archive</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-400">Category</label>
                <input className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" placeholder="Category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required />
              </div>
            </div>
          </div>
          
          {/* Main Details Column */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8 space-y-5 h-fit">
            <h2 className="text-lg font-medium mb-2 text-zinc-200">General Information</h2>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-400">Title</label>
              <input className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none" value={form.product_title} onChange={(event) => setForm({ ...form, product_title: event.target.value })} required />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-400">Subtitle</label>
              <input className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none" value={form.sub_title} onChange={(event) => setForm({ ...form, sub_title: event.target.value })} required />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-400">Description</label>
              <textarea className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none min-h-[160px]" value={form.product_description} onChange={(event) => setForm({ ...form, product_description: event.target.value })} required />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-400">Price ($)</label>
                <input type="number" step="0.01" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-400">Stock Available</label>
                <input type="number" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} required />
              </div>
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-400">Tags</label>
              <input className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none" value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} />
            </div>
            
            <div className="pt-6 mt-6 border-t border-zinc-800 flex justify-end gap-4">
              <button type="button" onClick={() => navigate('/products')} className="rounded-lg border border-zinc-700 px-6 py-3 font-medium text-zinc-300 hover:bg-zinc-800 transition-colors">
                Discard Changes
              </button>
              <button type="submit" className="rounded-lg bg-indigo-500 px-8 py-3 font-medium text-white hover:bg-indigo-600 transition-colors" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
          
        </form>
      </div>
    </div>
  );
}

export default ProductDetailsPage;
