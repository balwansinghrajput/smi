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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">Management</p>
            <h1 className="text-3xl font-semibold">Users</h1>
          </div>
          <a href="/dashboard" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800">Back to dashboard</a>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-800 text-zinc-400">
                <tr>
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Phone</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="py-4 font-medium">{user.name}</td>
                    <td className="py-4 text-zinc-400">{user.email}</td>
                    <td className="py-4 text-zinc-400">{user.phone || '-'}</td>
                    <td className="py-4">{user.role}</td>
                    <td className="py-4">
                      {user.is_blocked ? (
                        <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-500">Blocked</span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500">Active</span>
                      )}
                    </td>
                    <td className="py-4 flex gap-2">
                      <button 
                        onClick={() => handleToggleBlock(user)} 
                        className={`rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium ${user.is_blocked ? 'text-green-400 hover:bg-zinc-800' : 'text-orange-400 hover:bg-zinc-800'}`}
                      >
                        {user.is_blocked ? 'Unblock' : 'Block'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UsersPage;
