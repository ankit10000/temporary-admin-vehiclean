'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [transactionId, setTransactionId] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page) };
      if (statusFilter) params.status = statusFilter;
      const res = await adminAPI.getWithdrawals(params);
      setWithdrawals(res.data.data.withdrawals);
      setTotalPages(res.data.data.pagination?.pages || 1);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to load withdrawals'); } finally { setLoading(false); }
  };

  useEffect(() => { setPage(1); }, [statusFilter]);
  useEffect(() => { fetchWithdrawals(); }, [statusFilter, page]);

  const handleAction = async (id: string, status: string) => {
    try {
      const data: any = { status };
      if (status === 'paid') data.transactionId = transactionId;
      await adminAPI.updateWithdrawal(id, data);
      toast.success(`Withdrawal ${status}`);
      setShowModal(false);
      fetchWithdrawals();
    } catch { toast.error('Failed'); }
  };

  const columns = [
    { key: 'partnerId', label: 'Partner', render: (v: any) => v?.name || 'N/A' },
    { key: 'amount', label: 'Amount', render: (v: number) => `₹${v}` },
    { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
    { key: 'transactionId', label: 'Transaction ID', render: (v: string) => v || '-' },
    { key: 'createdAt', label: 'Date', render: (v: string) => new Date(v).toLocaleDateString('en-IN') },
    { key: '_id', label: 'Actions', render: (_: any, row: any) => row.status === 'pending' ? (
      <div className="flex gap-2">
        <button onClick={() => { setSelected(row); setTransactionId(''); setShowModal(true); }} className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-lg">Approve & Pay</button>
        <button onClick={() => handleAction(row._id, 'rejected')} className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-lg">Reject</button>
      </div>
    ) : null },
  ];

  return (
    <AdminLayout title="Withdrawal Management">
      <div className="mb-6">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm">
          <option value="">All Status</option>
          <option value="pending">Pending</option><option value="approved">Approved</option>
          <option value="rejected">Rejected</option><option value="paid">Paid</option>
        </select>
      </div>
      <DataTable columns={columns} data={withdrawals} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Process Withdrawal">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Amount: <span className="font-bold">₹{selected?.amount}</span></p>
          <p className="text-sm text-gray-600">Partner: <span className="font-medium">{selected?.partnerId?.name}</span></p>
          <input type="text" placeholder="Transaction ID" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm" />
          <button onClick={() => handleAction(selected?._id, 'paid')} className="w-full py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium">Mark as Paid</button>
        </div>
      </Modal>
    </AdminLayout>
  );
}
