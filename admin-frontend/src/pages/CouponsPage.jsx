import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCouponsRequest,
  createCouponRequest,
  updateCouponRequest,
  toggleCouponRequest,
  deleteCouponRequest,
  setSelectedCoupon,
  clearCreateError,
} from '../features/coupons/couponsSlice';

// ─── Constants ─────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  code: '',
  discount_type: 'percentage',
  discount_value: '',
  min_order_amount: '',
  max_discount: '',
  max_uses: '',
  max_uses_per_user: '',
  valid_from: '',
  valid_until: '',
  is_active: true,
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function fmt(date) {
  if (!date) return null;
  return new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function toLocalDatetimeValue(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function isExpired(coupon) {
  if (!coupon.valid_until) return false;
  return new Date(coupon.valid_until) < new Date();
}

function getStatus(coupon) {
  if (!coupon.is_active) return 'inactive';
  if (isExpired(coupon)) return 'expired';
  return 'active';
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ coupon }) {
  const status = getStatus(coupon);
  const cfg = {
    active: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30',
    inactive: 'bg-zinc-500/10 text-zinc-400 ring-1 ring-zinc-500/30',
    expired: 'bg-red-500/10 text-red-400 ring-1 ring-red-500/30',
  }[status];
  const dot = { active: 'bg-emerald-400', inactive: 'bg-zinc-500', expired: 'bg-red-400' }[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${cfg}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}

function UsageBar({ used = 0, max }) {
  if (!max) return null;
  const pct = Math.min((used / max) * 100, 100);
  const colour = pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-400' : 'bg-emerald-400';
  return (
    <div className="mt-2">
      <div className="mb-1 flex justify-between text-xs text-zinc-500">
        <span>Usage</span>
        <span className="font-medium text-zinc-300">{used} / {max}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
        <div className={`h-full rounded-full transition-all ${colour}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed ${
        checked ? 'bg-emerald-500' : 'bg-zinc-700'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function CouponCard({ coupon, onEdit, onDelete, onToggle }) {
  const status = getStatus(coupon);
  return (
    <article className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm transition-all duration-200 hover:border-zinc-700">
      {/* Header */}
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-mono text-lg font-bold tracking-widest text-indigo-400">{coupon.code}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <StatusBadge coupon={coupon} />
            <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
              {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
            </span>
          </div>
        </div>
        <ToggleSwitch
          checked={coupon.is_active}
          onChange={() => onToggle(coupon.id)}
          disabled={isExpired(coupon)}
        />
      </div>

      {/* Details */}
      <div className="space-y-1.5 text-xs text-zinc-400">
        {coupon.min_order_amount > 0 && (
          <div className="flex items-center gap-2">
            <svg className="h-3.5 w-3.5 shrink-0 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Min order: <strong className="text-zinc-300">₹{coupon.min_order_amount}</strong></span>
          </div>
        )}
        {coupon.discount_type === 'percentage' && coupon.max_discount && (
          <div className="flex items-center gap-2">
            <svg className="h-3.5 w-3.5 shrink-0 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Max discount: <strong className="text-zinc-300">₹{coupon.max_discount}</strong></span>
          </div>
        )}
        {coupon.max_uses_per_user && (
          <div className="flex items-center gap-2">
            <svg className="h-3.5 w-3.5 shrink-0 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Per user: <strong className="text-zinc-300">{coupon.max_uses_per_user}x</strong></span>
          </div>
        )}
        {(coupon.valid_from || coupon.valid_until) && (
          <div className="flex items-center gap-2">
            <svg className="h-3.5 w-3.5 shrink-0 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>
              {coupon.valid_from ? fmt(coupon.valid_from) : '∞'} → {coupon.valid_until ? fmt(coupon.valid_until) : '∞'}
            </span>
          </div>
        )}
      </div>

      {/* Usage bar */}
      <UsageBar used={coupon.usage_count ?? 0} max={coupon.max_uses} />

      {/* Actions */}
      <div className="mt-4 flex gap-2 border-t border-zinc-800/60 pt-4">
        <button
          onClick={() => onEdit(coupon)}
          className="flex-1 rounded-xl border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-indigo-500/50 hover:text-indigo-400"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(coupon)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-500/20 text-red-400 transition-colors hover:border-red-500/40 hover:bg-red-500/10"
          aria-label="Delete coupon"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="mb-3 flex justify-between">
        <div className="space-y-2">
          <div className="h-5 w-28 rounded bg-zinc-800" />
          <div className="h-4 w-20 rounded bg-zinc-800" />
        </div>
        <div className="h-6 w-11 rounded-full bg-zinc-800" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-36 rounded bg-zinc-800" />
        <div className="h-3 w-28 rounded bg-zinc-800" />
      </div>
      <div className="mt-4 flex gap-2 border-t border-zinc-800/60 pt-4">
        <div className="h-9 flex-1 rounded-xl bg-zinc-800" />
        <div className="h-9 w-9 rounded-xl bg-zinc-800" />
      </div>
    </div>
  );
}

// ─── Coupon Form ───────────────────────────────────────────────────────────────

function CouponForm({ initial, onSubmit, onCancel, loading, error }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const isEdit = !!initial?.id;

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order_amount: form.min_order_amount !== '' ? Number(form.min_order_amount) : 0,
      max_discount: form.max_discount !== '' ? Number(form.max_discount) : null,
      max_uses: form.max_uses !== '' ? Number(form.max_uses) : null,
      max_uses_per_user: form.max_uses_per_user !== '' ? Number(form.max_uses_per_user) : null,
      valid_from: form.valid_from ? new Date(form.valid_from).toISOString() : null,
      valid_until: form.valid_until ? new Date(form.valid_until).toISOString() : null,
      is_active: form.is_active,
    };
    onSubmit(payload);
  };

  const inputCls = 'w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 transition-colors focus:border-indigo-500 focus:outline-none';
  const labelCls = 'mb-1.5 block text-xs font-medium text-zinc-400';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {/* Code */}
      <div>
        <label className={labelCls}>Coupon Code *</label>
        <input
          className={`${inputCls} font-mono uppercase tracking-widest`}
          placeholder="SUMMER20"
          value={form.code}
          onChange={(e) => set('code', e.target.value.toUpperCase())}
          required
          minLength={3}
        />
      </div>

      {/* Discount type + value */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Discount Type *</label>
          <select
            className={inputCls}
            value={form.discount_type}
            onChange={(e) => set('discount_type', e.target.value)}
          >
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount (₹)</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>
            {form.discount_type === 'percentage' ? 'Discount (%)' : 'Discount (₹)'} *
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max={form.discount_type === 'percentage' ? 100 : undefined}
            className={inputCls}
            placeholder={form.discount_type === 'percentage' ? '20' : '100'}
            value={form.discount_value}
            onChange={(e) => set('discount_value', e.target.value)}
            required
          />
        </div>
      </div>

      {/* Max discount (only for percentage) */}
      {form.discount_type === 'percentage' && (
        <div>
          <label className={labelCls}>Max Discount (₹) <span className="text-zinc-600">optional cap</span></label>
          <input
            type="number"
            step="0.01"
            min="0"
            className={inputCls}
            placeholder="500"
            value={form.max_discount}
            onChange={(e) => set('max_discount', e.target.value)}
          />
        </div>
      )}

      {/* Min order + usage limits */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Min Order (₹) <span className="text-zinc-600">0 = none</span></label>
          <input
            type="number"
            step="0.01"
            min="0"
            className={inputCls}
            placeholder="0"
            value={form.min_order_amount}
            onChange={(e) => set('min_order_amount', e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Total Uses <span className="text-zinc-600">blank = ∞</span></label>
          <input
            type="number"
            min="1"
            className={inputCls}
            placeholder="100"
            value={form.max_uses}
            onChange={(e) => set('max_uses', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Per-User Limit <span className="text-zinc-600">blank = ∞</span></label>
        <input
          type="number"
          min="1"
          className={inputCls}
          placeholder="1"
          value={form.max_uses_per_user}
          onChange={(e) => set('max_uses_per_user', e.target.value)}
        />
      </div>

      {/* Validity dates */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Valid From</label>
          <input
            type="datetime-local"
            className={inputCls}
            value={form.valid_from}
            onChange={(e) => set('valid_from', e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Valid Until</label>
          <input
            type="datetime-local"
            className={inputCls}
            value={form.valid_until}
            onChange={(e) => set('valid_until', e.target.value)}
          />
        </div>
      </div>

      {/* Active toggle */}
      <div className="flex items-center justify-between rounded-xl border border-zinc-800 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-zinc-200">Active</p>
          <p className="text-xs text-zinc-500">Coupon can be used by customers</p>
        </div>
        <ToggleSwitch
          checked={form.is_active}
          onChange={() => set('is_active', !form.is_active)}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save Changes' : 'Create Coupon')}
        </button>
      </div>
    </form>
  );
}

// ─── Delete Modal ──────────────────────────────────────────────────────────────

function DeleteModal({ coupon, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
          <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h2 className="mb-2 text-lg font-semibold text-zinc-100">Delete Coupon?</h2>
        <p className="mb-6 text-sm text-zinc-400">
          This will permanently delete{' '}
          <span className="font-mono font-bold text-indigo-400">{coupon.code}</span>.
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-600">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Form Modal ────────────────────────────────────────────────────────────────

function FormModal({ title, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Filter / Search bar ───────────────────────────────────────────────────────

const FILTER_OPTS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'expired', label: 'Expired' },
];

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function CouponsPage() {
  const dispatch = useDispatch();
  const { items: coupons, loading, createError } = useSelector((state) => state.coupons);

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [mode, setMode] = useState(null); // null | 'create' | 'edit'
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { dispatch(fetchCouponsRequest()); }, [dispatch]);

  // Close modal automatically when a create/update succeeds (loading goes false, no error)
  useEffect(() => {
    if (submitting && !loading && !createError) {
      setMode(null);
      setEditTarget(null);
      setSubmitting(false);
    }
    if (!loading) setSubmitting(false);
  }, [loading, createError, submitting]);

  // ── Derived list ─────────────────────────────────────────────────────────────
  const filtered = coupons.filter((c) => {
    const matchSearch = !search || c.code.toLowerCase().includes(search.toLowerCase());
    const status = getStatus(c);
    const matchFilter = filter === 'all' || status === filter;
    return matchSearch && matchFilter;
  });

  // ── Stats ─────────────────────────────────────────────────────────────────────
  const stats = {
    total: coupons.length,
    active: coupons.filter((c) => getStatus(c) === 'active').length,
    inactive: coupons.filter((c) => !c.is_active && !isExpired(c)).length,
    expired: coupons.filter(isExpired).length,
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const openCreate = () => {
    dispatch(clearCreateError());
    setEditTarget(null);
    setMode('create');
  };

  const openEdit = (coupon) => {
    dispatch(clearCreateError());
    setEditTarget({
      ...coupon,
      valid_from: toLocalDatetimeValue(coupon.valid_from),
      valid_until: toLocalDatetimeValue(coupon.valid_until),
      max_discount: coupon.max_discount ?? '',
      max_uses: coupon.max_uses ?? '',
      max_uses_per_user: coupon.max_uses_per_user ?? '',
      min_order_amount: coupon.min_order_amount ?? '',
    });
    setMode('edit');
  };

  const closeModal = useCallback(() => {
    setMode(null);
    setEditTarget(null);
    dispatch(clearCreateError());
  }, [dispatch]);

  const handleCreate = (payload) => {
    setSubmitting(true);
    dispatch(createCouponRequest(payload));
  };

  const handleUpdate = (payload) => {
    setSubmitting(true);
    dispatch(updateCouponRequest({ id: editTarget.id, data: payload }));
  };

  const handleToggle = (id) => dispatch(toggleCouponRequest(id));

  const handleDeleteConfirm = () => {
    dispatch(deleteCouponRequest(deleteTarget.id));
    setDeleteTarget(null);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Page header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Marketing</p>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Coupons</h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Dashboard
            </a>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Coupon
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total', value: stats.total, colour: 'text-zinc-100' },
            { label: 'Active', value: stats.active, colour: 'text-emerald-400' },
            { label: 'Inactive', value: stats.inactive, colour: 'text-zinc-400' },
            { label: 'Expired', value: stats.expired, colour: 'text-red-400' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
              <p className="text-xs text-zinc-500">{s.label}</p>
              <p className={`mt-0.5 text-2xl font-bold ${s.colour}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters + search */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {FILTER_OPTS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  filter === opt.value
                    ? 'bg-indigo-600 text-white'
                    : 'border border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 sm:max-w-xs">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search by code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-2 pl-9 pr-4 text-sm text-zinc-200 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <p className="ml-auto shrink-0 text-sm text-zinc-500">
            {filtered.length} coupon{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Coupon grid */}
        {loading && coupons.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800">
              <svg className="h-7 w-7 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <h3 className="mb-1 text-base font-semibold text-zinc-300">No coupons found</h3>
            <p className="text-sm text-zinc-500">
              {filter !== 'all' ? `No ${filter} coupons.` : 'Create your first coupon to get started.'}
            </p>
            {filter === 'all' && (
              <button onClick={openCreate} className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                Create Coupon
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      {mode === 'create' && (
        <FormModal title="Create Coupon">
          <CouponForm
            onSubmit={handleCreate}
            onCancel={closeModal}
            loading={loading}
            error={createError}
          />
        </FormModal>
      )}

      {/* Edit modal */}
      {mode === 'edit' && editTarget && (
        <FormModal title="Edit Coupon">
          <CouponForm
            initial={editTarget}
            onSubmit={handleUpdate}
            onCancel={closeModal}
            loading={loading}
            error={createError}
          />
        </FormModal>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <DeleteModal
          coupon={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
