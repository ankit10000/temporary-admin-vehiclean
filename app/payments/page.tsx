'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import Pagination from '@/components/Pagination';
import { adminAPI } from '@/lib/api';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportToExcel, flattenForExport } from '@/lib/export';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { setPage(1); }, [methodFilter]);
  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { page: String(page) };
    if (methodFilter) params.method = methodFilter;
    adminAPI.getPayments(params).then((res) => { setPayments(res.data.data.payments); setTotalPages(res.data.data.pagination?.pages || 1); setLoading(false); }).catch((err) => { toast.error(err.response?.data?.message || 'Failed to load payments'); setLoading(false); });
  }, [methodFilter, page]);

  const columns = [
    { key: 'userId', label: 'Customer', render: (v: any) => v?.name || 'N/A' },
    { key: 'amount', label: 'Amount', render: (v: number) => `₹${v}` },
    { key: 'method', label: 'Method', render: (v: string) => <span className="uppercase text-xs font-medium">{v}</span> },
    { key: 'razorpayPaymentId', label: 'Razorpay ID', render: (v: string) => v || '-' },
    { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
    { key: 'createdAt', label: 'Date', render: (v: string) => new Date(v).toLocaleDateString('en-IN') },
  ];

  return (
    <AdminLayout title="Payment Management">
      <div className="mb-6 flex items-center justify-between">
        <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm">
          <option value="">All Methods</option>
          <option value="cod">COD</option>
          <option value="online">Online</option>
        </select>
        <button
          onClick={() => exportToExcel(
            flattenForExport(payments, [
              { key: '_id', label: 'Payment ID' },
              { key: 'userId.name', label: 'Customer' },
              { key: 'method', label: 'Method' },
              { key: 'amount', label: 'Amount' },
              { key: 'status', label: 'Status' },
              { key: 'razorpayPaymentId', label: 'Razorpay ID' },
              { key: 'createdAt', label: 'Date', transform: (v) => new Date(v).toLocaleDateString('en-IN') },
            ]),
            'payments'
          )}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
        >
          <Download size={16} /> Export
        </button>
      </div>
      <DataTable columns={columns} data={payments} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </AdminLayout>
  );
}
