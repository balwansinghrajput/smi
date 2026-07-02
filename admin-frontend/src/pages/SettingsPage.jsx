import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSettingsRequest, updateSettingsRequest } from '../features/settings/settingsSlice';

function SettingsPage() {
  const dispatch = useDispatch();
  const { data: settings, loading } = useSelector((state) => state.settings);
  const [form, setForm] = useState({
    site_name: '',
    currency: 'USD',
    tax_rate: 0,
    shipping_fee: 0,
    contact_email: '',
    contact_phone: '',
    address: ''
  });

  useEffect(() => {
    dispatch(fetchSettingsRequest());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setForm({
        site_name: settings.site_name || '',
        currency: settings.currency || 'USD',
        tax_rate: settings.tax_rate || 0,
        shipping_fee: settings.shipping_fee || 0,
        contact_email: settings.contact_email || '',
        contact_phone: settings.contact_phone || '',
        address: settings.address || ''
      });
    }
  }, [settings]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      tax_rate: Number(form.tax_rate),
      shipping_fee: Number(form.shipping_fee),
    };
    dispatch(updateSettingsRequest(payload));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">System</p>
            <h1 className="text-3xl font-semibold">Settings</h1>
          </div>
          <a href="/dashboard" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800">Back to dashboard</a>
        </div>
        
        <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Site Name</label>
              <input className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 focus:border-zinc-500" value={form.site_name} onChange={(e) => setForm({ ...form, site_name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Currency</label>
              <input className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 focus:border-zinc-500" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Tax Rate (%)</label>
              <input type="number" step="0.01" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 focus:border-zinc-500" value={form.tax_rate} onChange={(e) => setForm({ ...form, tax_rate: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Flat Shipping Fee</label>
              <input type="number" step="0.01" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 focus:border-zinc-500" value={form.shipping_fee} onChange={(e) => setForm({ ...form, shipping_fee: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Contact Email</label>
              <input type="email" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 focus:border-zinc-500" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Contact Phone</label>
              <input type="text" className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 focus:border-zinc-500" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-2">Store Address</label>
              <textarea className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 focus:border-zinc-500" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={3} />
            </div>
          </div>
          <div className="flex justify-end border-t border-zinc-800 pt-6">
            <button type="submit" className="rounded-lg bg-indigo-600 px-6 py-2 font-medium text-white hover:bg-indigo-700" disabled={loading}>
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SettingsPage;
