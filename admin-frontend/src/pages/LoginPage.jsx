import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../features/auth/authSlice';

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const { register, handleSubmit } = useForm();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (values) => dispatch(loginRequest(values));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">Admin access</p>
          <h1 className="mt-2 text-3xl font-semibold">Sign in</h1>
          <p className="mt-2 text-sm text-zinc-400">Use your backend admin credentials.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-zinc-300">Email</label>
            <input
              {...register('email', { required: true })}
              type="email"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 outline-none ring-0"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-zinc-300">Password</label>
            <input
              {...register('password', { required: true })}
              type="password"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 outline-none ring-0"
              placeholder="Password"
            />
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <button type="submit" className="w-full rounded-lg bg-white px-4 py-2 font-medium text-zinc-950 disabled:opacity-60" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
