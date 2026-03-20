'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function RefundsPage() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('refund_pending');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [transactionId, setTransactionId] = useState('');
  const [processing, setProcessing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page) };
      if (statusFilter) params.status = statusFilter;
      const res = await adminAPI.getRefunds(params);
      setRefunds(res.data.data.refunds);
      setTotalPages(res.data.data.pagination?.pages || 1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load refunds');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(1); }, [statusFilter]);
  useEffect(() => { fetchRefunds(); }, [statusFilter, page]);

  const handleProcessRefund = async () => {
    if (!selected) return;
    setProcessing(true);
    try {
      await adminAPI.processRefund(selected._id, { transactionId });
      toast.success('Refund marked as processed');
      setShowModal(false);
      setSelected(null);
      setTransactionId('');
      fetchRefunds();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to process refund');
    } finally {
      setProcessing(false);
    }
  };

  const columns = [
    {
      key: 'userId',
      label: 'Customer',
      render: (v: any) => (
        <div>
          <p className="text-sm font-medium">{v?.name || 'N/A'}</p>
          <p className="text-xs text-gray-400">{v?.phone || ''}</p>
        </div>
      ),
    },
    { key: 'serviceId', label: 'Service', render: (v: any) => v?.name || 'N/A' },
    { key: 'finalAmount', label: 'Amount', render: (v: number) => <span className="font-semibold">{'\u20B9'}{v}</span> },
    { key: 'cancelledBy', label: 'Cancelled By', render: (v: string) => <StatusBadge status={v || 'unknown'} /> },
    { key: 'paymentStatus', label: 'Refund Status', render: (v: string) => <StatusBadge status={v} /> },
    {
      key: 'updatedAt',
      label: 'Date',
      render: (v: string) => new Date(v).toLocaleDateString('en-IN'),
    },
    {
      key: '_id',
      label: 'Actions',
      render: (_: any, row: any) =>
        row.paymentStatus === 'refund_pending' ? (
          <button
            onClick={() => {
              setSelected(row);
              setTransactionId('');
              setShowModal(true);
            }}
            className="text-xs px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg font-medium"
          >
            Process Refund
          </button>
        ) : row.paymentStatus === 'refunded' ? (
          <span className="text-xs text-green-600 font-medium">Refunded</span>
        ) : null,
    },
  ];

  return (
    <AdminLayout title="Refund Management">
      <div className="mb-6 flex items-center gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
        >
          <option value="refund_pending">Pending Refunds</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <DataTable columns={columns} data={refunds} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Process Refund">
        <div className="space-y-4">
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <p className="text-xs text-gray-500 mb-1">Refund Amount</p>
            <p className="text-2xl font-bold text-purple-700">{'\u20B9'}{selected?.finalAmount}</p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              Customer: <span className="font-medium">{selected?.userId?.name}</span>
            </p>
            <p className="text-sm text-gray-600">
              Phone: <span className="font-medium">{selected?.userId?.phone}</span>
            </p>
            <p className="text-sm text-gray-600">
              Cancelled By: <span className="font-medium capitalize">{selected?.cancelledBy}</span>
            </p>
            {selected?.cancelReason && (
              <p className="text-sm text-gray-600">
                Reason: <span className="font-medium">{selected.cancelReason}</span>
              </p>
            )}
          </div>

          {/* Customer Payment Details */}
          {(selected?.userId?.upiId || selected?.userId?.bankDetails?.accountNumber) ? (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer Payment Details</p>
              {selected?.userId?.upiId && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">UPI ID</span>
                  <span className="text-sm font-semibold text-gray-800">{selected.userId.upiId}</span>
                </div>
              )}
              {selected?.userId?.bankDetails?.accountHolder && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Account Holder</span>
                  <span className="text-sm font-medium text-gray-800">{selected.userId.bankDetails.accountHolder}</span>
                </div>
              )}
              {selected?.userId?.bankDetails?.accountNumber && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Account No.</span>
                  <span className="text-sm font-medium text-gray-800">{selected.userId.bankDetails.accountNumber}</span>
                </div>
              )}
              {selected?.userId?.bankDetails?.ifscCode && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">IFSC</span>
                  <span className="text-sm font-medium text-gray-800">{selected.userId.bankDetails.ifscCode}</span>
                </div>
              )}
              {selected?.userId?.bankDetails?.bankName && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Bank</span>
                  <span className="text-sm font-medium text-gray-800">{selected.userId.bankDetails.bankName}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-orange-600 bg-orange-50 rounded-lg p-3 border border-orange-100">
              Customer has not added bank/UPI details yet. Please ask them to add details from the app.
            </p>
          )}

          <input
            type="text"
            placeholder="Transaction / Reference ID"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
          />
          <button
            onClick={handleProcessRefund}
            disabled={processing}
            className="w-full py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {processing ? 'Processing...' : 'Mark as Refunded'}
          </button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
