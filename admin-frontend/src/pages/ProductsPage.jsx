import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { deleteProductRequest, fetchProductsRequest } from '../features/products/productsSlice';

function ProductsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: products } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProductsRequest());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 relative">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">Inventory</p>
            <h1 className="text-3xl font-semibold">Products</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="/dashboard" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-center hover:bg-zinc-800 transition-colors">Back to dashboard</a>
            <button onClick={() => navigate('/products/new')} className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 transition-colors">Create Product</button>
          </div>
        </div>
        
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold mb-6">Product list</h2>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div key={product.id} className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-950/50 p-5 hover:border-zinc-700 transition-colors shadow-sm">
                
                <div className="flex gap-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-800 border border-zinc-700">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.product_title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">No Img</div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center overflow-hidden">
                    <p className="truncate font-semibold text-zinc-100 text-lg">{product.product_title}</p>
                    <p className="text-xs text-indigo-400 font-medium tracking-wide uppercase mb-1">{product.category}</p>
                    <p className="text-sm font-medium text-emerald-400">${product.price?.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between text-sm text-zinc-400">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${product.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-zinc-800 text-zinc-500'}`}>
                    {product.status}
                  </span>
                  <span>Stock: {product.stock}</span>
                </div>
                
                <div className="mt-5 flex gap-2 border-t border-zinc-800 pt-4">
                  <button onClick={() => navigate(`/products/${product.id}`)} className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors font-medium">Product Details</button>
                  <button onClick={() => dispatch(deleteProductRequest(product.id))} className="rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/20 transition-colors">Delete</button>
                </div>
                
              </div>
            ))}
            
            {products.length === 0 && (
              <div className="col-span-full py-12 text-center text-zinc-500">
                <p>No products found in inventory.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;
