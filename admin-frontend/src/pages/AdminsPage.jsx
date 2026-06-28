import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminsRequest } from '../features/admins/adminsSlice';

function AdminsPage() {
  const dispatch = useDispatch();
  const { items: admins, loading } = useSelector((state) => state.admins);

  useEffect(() => {
    dispatch(fetchAdminsRequest());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">Access</p>
            <h1 className="text-3xl font-semibold">Admins</h1>
          </div>
          <a href="/dashboard" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm">Back to dashboard</a>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="space-y-3">
            {admins.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between rounded-xl border border-zinc-800 p-4">
                <div>
                  <p className="font-medium">{admin.email}</p>
                  <p className="text-sm text-zinc-400">{admin.role} • {admin.is_active ? 'Active' : 'Inactive'}</p>
                </div>
                <span className="rounded-full border border-zinc-700 px-3 py-1 text-sm">{admin.phone_number}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminsPage;
