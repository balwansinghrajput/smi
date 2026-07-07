import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchReviewsRequest,
  updateReviewStatusRequest,
  deleteReviewRequest,
} from '../features/reviews/reviewsSlice';

// ── helpers ──────────────────────────────────────────────────────────────────

function StarRating({ rating, max = 5 }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          fill={i < rating ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={i < rating ? 0 : 1.5}
          className={`h-4 w-4 ${i < rating ? 'text-amber-400' : 'text-zinc-600'}`}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1.5 text-sm font-semibold text-amber-400">{rating}</span>
    </div>
  );
}

const STATUS_CONFIG = {
  approved: {
    label: 'Approved',
    classes: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  rejected: {
    label: 'Rejected',
    classes: 'bg-red-500/10 text-red-400 ring-1 ring-red-500/30',
    dot: 'bg-red-400',
  },
  pending: {
    label: 'Pending',
    classes: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30',
    dot: 'bg-amber-400',
  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.classes}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function Avatar({ name, email }) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : (email ? email[0].toUpperCase() : '?');

  // deterministic colour from initials
  const colours = [
    'from-indigo-500 to-purple-500',
    'from-emerald-500 to-teal-500',
    'from-pink-500 to-rose-500',
    'from-amber-500 to-orange-500',
    'from-sky-500 to-cyan-500',
  ];
  const idx = initials.charCodeAt(0) % colours.length;

  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${colours[idx]} text-sm font-bold text-white shadow-md`}
      aria-label={name || email || 'Unknown user'}
    >
      {initials}
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return null;
  }
}

// ── delete confirm modal ──────────────────────────────────────────────────────

function DeleteModal({ review, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
          <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <h2 id="delete-modal-title" className="mb-2 text-lg font-semibold text-zinc-100">
          Delete Review?
        </h2>
        <p className="mb-6 text-sm text-zinc-400">
          This will permanently remove the review by{' '}
          <span className="font-medium text-zinc-200">
            {review.user_name || review.author || 'this user'}
          </span>
          . This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── review card ───────────────────────────────────────────────────────────────

function ReviewCard({ review, onStatusChange, onDelete }) {
  const displayName = review.user_name || review.author || 'Unknown User';
  const displayEmail = review.user_email;
  const productName = review.product_title;
  const dateStr = formatDate(review.created_at);

  return (
    <article className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm transition-all duration-200 hover:border-zinc-700 hover:shadow-md">
      {/* ── header: user info + status badge ── */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={displayName} email={displayEmail} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-100">{displayName}</p>
            {displayEmail && (
              <p className="truncate text-xs text-zinc-400">{displayEmail}</p>
            )}
          </div>
        </div>
        <StatusBadge status={review.status} />
      </div>

      {/* ── star rating ── */}
      <div className="mb-3">
        <StarRating rating={review.rating} />
      </div>

      {/* ── comment ── */}
      <p className="mb-4 flex-1 text-sm leading-relaxed text-zinc-300 line-clamp-4">
        {review.comment || <span className="italic text-zinc-500">No comment provided.</span>}
      </p>

      {/* ── meta: product + date ── */}
      <div className="mb-4 space-y-1.5">
        {productName && (
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <svg className="h-3.5 w-3.5 shrink-0 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
            </svg>
            <span className="truncate font-medium text-zinc-300">{productName}</span>
          </div>
        )}
        {!productName && review.product_id && (
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
            </svg>
            <span className="truncate font-mono">{review.product_id}</span>
          </div>
        )}
        {dateStr && (
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{dateStr}</span>
          </div>
        )}
      </div>

      {/* ── actions ── */}
      <div className="flex items-center gap-2 border-t border-zinc-800/60 pt-4">
        <select
          value={review.status}
          onChange={(e) => onStatusChange(review.id, e.target.value)}
          aria-label="Change review status"
          className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-200 transition-colors focus:border-indigo-500 focus:outline-none hover:border-zinc-600"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button
          onClick={() => onDelete(review)}
          aria-label="Delete review"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-500/20 text-red-400 transition-colors hover:border-red-500/40 hover:bg-red-500/10"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
          </svg>
        </button>
      </div>
    </article>
  );
}

// ── loading skeleton ──────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-zinc-800" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-32 rounded bg-zinc-800" />
          <div className="h-3 w-48 rounded bg-zinc-800" />
        </div>
      </div>
      <div className="mb-3 flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-4 w-4 rounded bg-zinc-800" />
        ))}
      </div>
      <div className="mb-4 space-y-2">
        <div className="h-3 w-full rounded bg-zinc-800" />
        <div className="h-3 w-4/5 rounded bg-zinc-800" />
        <div className="h-3 w-3/5 rounded bg-zinc-800" />
      </div>
      <div className="mt-4 border-t border-zinc-800/60 pt-4">
        <div className="h-9 w-full rounded-xl bg-zinc-800" />
      </div>
    </div>
  );
}

// ── empty state ───────────────────────────────────────────────────────────────

function EmptyState({ activeFilter }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800">
        <svg className="h-7 w-7 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h3 className="mb-1 text-base font-semibold text-zinc-300">No reviews found</h3>
      <p className="text-sm text-zinc-500">
        {activeFilter !== 'all'
          ? `No ${activeFilter} reviews at the moment.`
          : 'There are no product reviews yet.'}
      </p>
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

function ReviewsPage() {
  const dispatch = useDispatch();
  const { items: reviews, pagination, loading, error } = useSelector((state) => state.reviews);

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewToDelete, setReviewToDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchReviewsRequest());
  }, [dispatch]);

  const handleStatusChange = (reviewId, newStatus) => {
    dispatch(updateReviewStatusRequest({ id: reviewId, data: { status: newStatus } }));
  };

  const handleDeleteConfirm = () => {
    if (reviewToDelete) {
      dispatch(deleteReviewRequest(reviewToDelete.id));
      setReviewToDelete(null);
    }
  };

  // Client-side filtering
  const filteredReviews = reviews.filter((r) => {
    const matchesStatus = activeFilter === 'all' || r.status === activeFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (r.user_name || r.author || '').toLowerCase().includes(q) ||
      (r.user_email || '').toLowerCase().includes(q) ||
      (r.product_title || '').toLowerCase().includes(q) ||
      (r.comment || '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  // Stats
  const totalCount = reviews.length;
  const pendingCount = reviews.filter((r) => r.status === 'pending').length;
  const approvedCount = reviews.filter((r) => r.status === 'approved').length;
  const rejectedCount = reviews.filter((r) => r.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ── page header ── */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Content Management
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Product Reviews</h1>
          </div>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 self-start rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800 sm:self-auto"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Dashboard
          </a>
        </div>

        {/* ── stats strip ── */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total Reviews', value: totalCount, colour: 'text-zinc-100' },
            { label: 'Pending', value: pendingCount, colour: 'text-amber-400' },
            { label: 'Approved', value: approvedCount, colour: 'text-emerald-400' },
            { label: 'Rejected', value: rejectedCount, colour: 'text-red-400' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3"
            >
              <p className="text-xs text-zinc-500">{stat.label}</p>
              <p className={`mt-0.5 text-2xl font-bold ${stat.colour}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* ── filters + search ── */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setActiveFilter(opt.value)}
                className={`shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  activeFilter === opt.value
                    ? 'bg-indigo-600 text-white'
                    : 'border border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* search */}
          <div className="relative flex-1 sm:max-w-xs lg:max-w-sm">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search user, product, comment…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-2 pl-9 pr-4 text-sm text-zinc-200 placeholder-zinc-500 transition-colors focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* result count */}
          <p className="ml-auto shrink-0 text-sm text-zinc-500">
            {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* ── error banner ── */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* ── content grid ── */}
        {loading && reviews.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredReviews.length === 0 ? (
          <EmptyState activeFilter={activeFilter} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onStatusChange={handleStatusChange}
                onDelete={setReviewToDelete}
              />
            ))}
          </div>
        )}

        {/* ── pagination info ── */}
        {pagination && pagination.total_pages > 1 && (
          <div className="mt-8 flex flex-col items-center gap-1 text-center text-sm text-zinc-500">
            <p>
              Page <span className="font-medium text-zinc-300">{pagination.current_page}</span> of{' '}
              <span className="font-medium text-zinc-300">{pagination.total_pages}</span>
            </p>
            <p className="text-xs">
              Showing up to 50 reviews per page •{' '}
              <span className="text-zinc-400">{pagination.total_reviews} total</span>
            </p>
          </div>
        )}
      </div>

      {/* ── delete confirmation modal ── */}
      {reviewToDelete && (
        <DeleteModal
          review={reviewToDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setReviewToDelete(null)}
        />
      )}
    </div>
  );
}

export default ReviewsPage;
