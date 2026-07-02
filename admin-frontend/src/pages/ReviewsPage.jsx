import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReviewsRequest, updateReviewStatusRequest, deleteReviewRequest } from '../features/reviews/reviewsSlice';

function ReviewsPage() {
  const dispatch = useDispatch();
  const { items: reviews, loading } = useSelector((state) => state.reviews);

  useEffect(() => {
    dispatch(fetchReviewsRequest());
  }, [dispatch]);

  const handleStatusChange = (reviewId, newStatus) => {
    dispatch(updateReviewStatusRequest({ id: reviewId, data: { status: newStatus } }));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">Content</p>
            <h1 className="text-3xl font-semibold">Reviews</h1>
          </div>
          <a href="/dashboard" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800">Back to dashboard</a>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-800 text-zinc-400">
                <tr>
                  <th className="pb-3 font-medium">User ID</th>
                  <th className="pb-3 font-medium">Product ID</th>
                  <th className="pb-3 font-medium">Rating</th>
                  <th className="pb-3 font-medium">Comment</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {reviews.map((review) => (
                  <tr key={review.id}>
                    <td className="py-4 font-mono text-xs text-zinc-400">{review.user_id}</td>
                    <td className="py-4 font-mono text-xs text-zinc-400">{review.product_id}</td>
                    <td className="py-4">
                      <div className="flex items-center">
                        <span className="text-yellow-500 font-medium">{review.rating}</span>
                        <span className="text-zinc-500 ml-1">/ 5</span>
                      </div>
                    </td>
                    <td className="py-4 max-w-xs truncate" title={review.comment}>{review.comment}</td>
                    <td className="py-4">
                      <select 
                        value={review.status}
                        onChange={(e) => handleStatusChange(review.id, e.target.value)}
                        className={`rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm focus:border-zinc-500 focus:outline-none ${
                          review.status === 'approved' ? 'text-green-400' : review.status === 'rejected' ? 'text-red-400' : 'text-yellow-400'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="py-4">
                      <button onClick={() => dispatch(deleteReviewRequest(review.id))} className="text-red-400 hover:text-red-300">Delete</button>
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

export default ReviewsPage;
