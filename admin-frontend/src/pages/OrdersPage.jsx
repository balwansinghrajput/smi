import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrdersRequest, updateOrderStatusRequest } from '../features/orders/ordersSlice';

function OrdersPage() {
  const dispatch = useDispatch();
  const { items: orders, loading } = useSelector((state) => state.orders);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
  const [paidAmount, setPaidAmount] = useState('');

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState(null);

  useEffect(() => {
    dispatch(fetchOrdersRequest());
  }, [dispatch]);

  const handleStatusChange = (orderId, newStatus) => {
    dispatch(updateOrderStatusRequest({ id: orderId, data: { status: newStatus } }));
  };

  const openPaymentModal = (order) => {
    setSelectedOrderForPayment(order);
    setPaidAmount(order.payment?.paidAmount !== undefined ? order.payment.paidAmount : order.total);
    setPaymentModalOpen(true);
  };

  const openDetailsModal = (order) => {
    setSelectedOrderForDetails(order);
    setDetailsModalOpen(true);
  };

  const submitPaymentUpdate = () => {
    if (!selectedOrderForPayment) return;
    dispatch(updateOrderStatusRequest({ 
      id: selectedOrderForPayment.id, 
      data: { 
        payment_status: 'paid',
        paid_amount: parseFloat(paidAmount)
      } 
    }));
    setPaymentModalOpen(false);
    setSelectedOrderForPayment(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">Sales</p>
            <h1 className="text-3xl font-semibold">Orders</h1>
          </div>
          <a href="/dashboard" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800">Back to dashboard</a>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <div key={order.id} className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm transition-colors hover:border-zinc-700">
              <div>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <h2 className="truncate font-mono text-lg font-semibold text-zinc-100">#{order.id.slice(-8)}</h2>
                  <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium uppercase ${
                    order.payment?.status === 'paid' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {order.payment?.status}
                  </span>
                </div>
                
                <div className="space-y-3 text-sm text-zinc-400">
                  <p className="flex items-center gap-2"><span className="w-20 shrink-0 text-zinc-500">Customer:</span> <span className="truncate font-mono text-zinc-300">{order.userId}</span></p>
                  <p className="flex items-center gap-2"><span className="w-20 shrink-0 text-zinc-500">Amount:</span> <span className="text-zinc-300 font-medium text-emerald-400">${order.total?.toFixed(2)}</span></p>
                  
                  {order.payment?.status === 'paid' && order.payment?.paidAmount != null && (
                    <p className="flex items-center gap-2"><span className="w-20 shrink-0 text-zinc-500">Paid Amt:</span> <span className="text-zinc-300">${order.payment.paidAmount?.toFixed(2)}</span></p>
                  )}
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-20 shrink-0 text-zinc-500">Status:</span>
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-zinc-200 focus:border-zinc-500 focus:outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3 border-t border-zinc-800/50 pt-4">
                {order.payment?.status !== 'paid' && (
                  <button 
                    onClick={() => openPaymentModal(order)}
                    className="flex-1 rounded-lg border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 px-4 py-2 text-sm font-medium transition-colors"
                  >
                    Mark Paid
                  </button>
                )}
                <button 
                  onClick={() => openDetailsModal(order)}
                  className="flex-1 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {paymentModalOpen && selectedOrderForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-semibold text-zinc-100">Mark as Paid</h2>
            <p className="mb-4 text-sm text-zinc-400">
              Update the payment status for order <span className="font-mono text-zinc-300">{selectedOrderForPayment.id}</span>.
            </p>
            <div className="mb-6">
              <label htmlFor="paidAmount" className="mb-2 block text-sm text-zinc-400">Paid Amount ($)</label>
              <input
                type="number"
                id="paidAmount"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-zinc-100 focus:border-indigo-500 focus:outline-none"
                step="0.01"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setPaymentModalOpen(false)}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button 
                onClick={submitPaymentUpdate}
                className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {detailsModalOpen && selectedOrderForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-zinc-100">Order Details</h2>
              <button onClick={() => setDetailsModalOpen(false)} className="text-zinc-400 hover:text-zinc-200 text-2xl leading-none">&times;</button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-zinc-500">Order ID</p>
                  <p className="font-mono text-zinc-300">{selectedOrderForDetails.id}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Date</p>
                  <p className="text-zinc-300">
                    {selectedOrderForDetails.createdAt ? new Date(selectedOrderForDetails.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-zinc-500">User ID</p>
                  <p className="font-mono text-zinc-300">{selectedOrderForDetails.userId}</p>
                </div>
                <div>
                  <p className="text-zinc-500">Order Status</p>
                  <p className="text-zinc-300 uppercase">{selectedOrderForDetails.status}</p>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-medium text-zinc-300 border-b border-zinc-800 pb-2">Items</h3>
                <div className="space-y-3">
                  {selectedOrderForDetails.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <div className="flex gap-3">
                        <span className="text-zinc-400">{item.quantity}x</span>
                        <span className="text-zinc-200">{item.product?.name || item.product?.product_title || item.productId}</span>
                      </div>
                      <span className="text-zinc-300">${item.lineTotal?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="mb-2 font-medium text-zinc-300 border-b border-zinc-800 pb-2">Financials</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-zinc-500">Subtotal:</span> <span className="text-zinc-300">${selectedOrderForDetails.subtotal?.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">Shipping:</span> <span className="text-zinc-300">${selectedOrderForDetails.shipping?.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-500">Tax:</span> <span className="text-zinc-300">${selectedOrderForDetails.tax?.toFixed(2)}</span></div>
                    <div className="flex justify-between font-medium mt-2 pt-2 border-t border-zinc-800/50"><span className="text-zinc-400">Total:</span> <span className="text-indigo-400">${selectedOrderForDetails.total?.toFixed(2)}</span></div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 font-medium text-zinc-300 border-b border-zinc-800 pb-2">Shipping Address</h3>
                  <div className="text-sm text-zinc-400">
                    <p className="text-zinc-300">{selectedOrderForDetails.shippingAddress?.fullName}</p>
                    <p>{selectedOrderForDetails.shippingAddress?.address}</p>
                    <p>{selectedOrderForDetails.shippingAddress?.city}, {selectedOrderForDetails.shippingAddress?.state} {selectedOrderForDetails.shippingAddress?.pincode}</p>
                    <p className="mt-1">Email: {selectedOrderForDetails.shippingAddress?.email}</p>
                    <p>Phone: {selectedOrderForDetails.shippingAddress?.phone}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="mb-2 font-medium text-zinc-300 border-b border-zinc-800 pb-2">Payment Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-zinc-500">Method</p>
                    <p className="text-zinc-300 uppercase">{selectedOrderForDetails.payment?.method}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Status</p>
                    <p className="text-zinc-300 uppercase">{selectedOrderForDetails.payment?.status}</p>
                  </div>
                  {selectedOrderForDetails.payment?.transactionId && (
                    <div>
                      <p className="text-zinc-500">Transaction ID</p>
                      <p className="font-mono text-zinc-300">{selectedOrderForDetails.payment?.transactionId}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
