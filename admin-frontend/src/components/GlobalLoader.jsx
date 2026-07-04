import { useState, useEffect } from 'react';

export default function GlobalLoader() {
  const [globalLoading, setGlobalLoading] = useState(false);

  useEffect(() => {
    const showLoader = () => setGlobalLoading(true);
    const hideLoader = () => setGlobalLoading(false);

    window.addEventListener('show-global-loader', showLoader);
    window.addEventListener('hide-global-loader', hideLoader);

    return () => {
      window.removeEventListener('show-global-loader', showLoader);
      window.removeEventListener('hide-global-loader', hideLoader);
    };
  }, []);

  if (!globalLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-500"></div>
        <p className="mt-4 text-sm font-medium tracking-widest text-indigo-400 uppercase">Loading...</p>
      </div>
    </div>
  );
}
