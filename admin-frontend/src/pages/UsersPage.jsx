import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsersRequest, updateUserRequest, deleteUserRequest } from '../features/users/usersSlice';

function UsersPage() {
  const dispatch = useDispatch();
  const { items: users, loading } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchUsersRequest());
  }, [dispatch]);

  const handleToggleBlock = (user) => {
    dispatch(updateUserRequest({ id: user.id, data: { is_blocked: !user.is_blocked } }));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">Management</p>
            <h1 className="text-3xl font-semibold">Users</h1>
          </div>
          <a href="/dashboard" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800">Back to dashboard</a>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <div key={user.id} className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm transition-colors hover:border-zinc-700">
              <div>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h2 className="truncate text-lg font-semibold">{user.name}</h2>
                  {user.is_blocked ? (
                    <span className="inline-flex shrink-0 items-center rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-500">Blocked</span>
                  ) : (
                    <span className="inline-flex shrink-0 items-center rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-500">Active</span>
                  )}
                </div>
                <div className="space-y-2 text-sm text-zinc-400">
                  <p className="flex items-center gap-2"><span className="w-16 shrink-0 text-zinc-500">Email:</span> <span className="truncate text-zinc-300">{user.email}</span></p>
                  <p className="flex items-center gap-2"><span className="w-16 shrink-0 text-zinc-500">Phone:</span> <span className="text-zinc-300">{user.phone || '-'}</span></p>
                  <p className="flex items-center gap-2"><span className="w-16 shrink-0 text-zinc-500">Role:</span> <span className="capitalize text-zinc-300">{user.role}</span></p>
                  <p className="flex items-center gap-2"><span className="w-16 shrink-0 text-zinc-500">Orders:</span> <span className="text-zinc-300">{user.total_orders || 0}</span></p>
                  <p className="flex items-center gap-2"><span className="w-16 shrink-0 text-zinc-500">Spent:</span> <span className="text-zinc-300 font-medium text-emerald-400">${(user.total_spent || 0).toFixed(2)}</span></p>
                </div>
              </div>
              <div className="mt-6 border-t border-zinc-800/50 pt-4">
                <button 
                  onClick={() => handleToggleBlock(user)} 
                  className={`w-full rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${user.is_blocked ? 'border-green-500/30 text-green-400 hover:bg-green-500/10' : 'border-orange-500/30 text-orange-400 hover:bg-orange-500/10'}`}
                >
                  {user.is_blocked ? 'Unblock User' : 'Block User'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UsersPage;
