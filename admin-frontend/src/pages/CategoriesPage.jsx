import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createCategoryRequest, deleteCategoryRequest, fetchCategoriesRequest } from '../features/categories/categoriesSlice';

function CategoriesPage() {
  const dispatch = useDispatch();
  const { items: categories, loading } = useSelector((state) => state.categories);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category_image: null,
  });

  useEffect(() => {
    dispatch(fetchCategoriesRequest());
  }, [dispatch]);

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(createCategoryRequest(form));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">Inventory</p>
            <h1 className="text-3xl font-semibold">Categories</h1>
          </div>
          <a href="/dashboard" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800">Back to dashboard</a>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-xl font-semibold">Category list</h2>
            <div className="mt-4 space-y-3">
              {categories.map((category) => (
                <div key={category.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-zinc-800 p-4">
                  <div className="flex items-center gap-4">
                    {category.image_url && <img src={category.image_url} alt={category.title} className="h-10 w-10 rounded-md object-cover" />}
                    <div>
                      <p className="font-medium">{category.title}</p>
                      <p className="text-sm text-zinc-400">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => dispatch(deleteCategoryRequest(category.id))} className="rounded-lg bg-red-600/10 text-red-500 hover:bg-red-600/20 px-3 py-2 text-sm font-medium">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 h-fit">
            <h2 className="text-xl font-semibold">Create category</h2>
            <div className="mt-4 space-y-3">
              <input className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 focus:border-zinc-500 focus:outline-none" placeholder="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
              <textarea className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 focus:border-zinc-500 focus:outline-none" placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
              <input type="file" accept="image/*" onChange={(event) => setForm({ ...form, category_image: event.target.files?.[0] || null })} className="text-sm text-zinc-400" />
              <button type="submit" className="w-full rounded-lg bg-white px-4 py-2 font-medium text-zinc-950 hover:bg-zinc-200" disabled={loading}>Create category</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CategoriesPage;
