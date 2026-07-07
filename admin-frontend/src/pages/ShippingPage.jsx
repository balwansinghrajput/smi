import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchMethodsRequest, 
  createMethodRequest, 
  updateMethodRequest, 
  deleteMethodRequest, 
  toggleMethodRequest 
} from '../features/shipping/shippingSlice';
import { PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import Modal from '../components/Modal';

function ShippingPage() {
  const dispatch = useDispatch();
  const { methods, loading } = useSelector((state) => state.shipping);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    charge: 0,
    estimated_days: '',
    is_active: true
  });

  useEffect(() => {
    dispatch(fetchMethodsRequest());
  }, [dispatch]);

  const handleOpenModal = (method = null) => {
    if (method) {
      setEditingMethod(method);
      setForm({
        name: method.name,
        description: method.description,
        charge: method.charge,
        estimated_days: method.estimated_days,
        is_active: method.is_active
      });
    } else {
      setEditingMethod(null);
      setForm({
        name: '',
        description: '',
        charge: 0,
        estimated_days: '',
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      charge: Number(form.charge)
    };
    
    if (editingMethod) {
      dispatch(updateMethodRequest({ 
        id: editingMethod._id, 
        data: payload,
        meta: { onSuccess: () => setIsModalOpen(false) } 
      }));
    } else {
      dispatch(createMethodRequest({ 
        ...payload, 
        meta: { onSuccess: () => setIsModalOpen(false) } 
      }));
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">Settings</p>
            <h1 className="text-3xl font-semibold">Shipping Methods</h1>
          </div>
          {methods.length < 2 && (
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              Add Delivery Method
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {methods.map((method) => (
            <div key={method._id} className={`rounded-2xl border ${method.is_active ? 'border-zinc-800' : 'border-zinc-800/50 opacity-75'} bg-zinc-900 p-6 flex flex-col transition-all`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-semibold text-white">{method.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${method.is_active ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}>
                      {method.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400">{method.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-white">₹{method.charge}</span>
                </div>
              </div>
              
              <div className="mt-2 mb-6">
                <div className="flex items-center text-sm text-zinc-300">
                  <svg className="w-4 h-4 mr-2 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Est. Delivery: {method.estimated_days}
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-zinc-800 flex justify-between items-center">
                <button
                  onClick={() => dispatch(toggleMethodRequest(method._id))}
                  className={`text-sm font-medium transition-colors ${method.is_active ? 'text-amber-400 hover:text-amber-300' : 'text-green-400 hover:text-green-300'}`}
                >
                  {method.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(method)}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this delivery method?')) {
                        dispatch(deleteMethodRequest(method._id));
                      }
                    }}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {methods.length === 0 && !loading && (
            <div className="col-span-full py-12 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/50">
              <p className="text-zinc-400 mb-4">No delivery methods configured.</p>
              <button
                onClick={() => handleOpenModal()}
                className="text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Create your first delivery method
              </button>
            </div>
          )}
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">{editingMethod ? 'Edit Delivery Method' : 'Add Delivery Method'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Method Name</label>
                <input
                  required
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. Standard Delivery"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Description</label>
                <input
                  required
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. Ships via BlueDart"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Charge (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    value={form.charge}
                    onChange={(e) => setForm({ ...form, charge: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1">Estimated Days</label>
                  <input
                    required
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="e.g. 3-5 Business Days"
                    value={form.estimated_days}
                    onChange={(e) => setForm({ ...form, estimated_days: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-zinc-700 text-sm font-medium hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Method'}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default ShippingPage;
