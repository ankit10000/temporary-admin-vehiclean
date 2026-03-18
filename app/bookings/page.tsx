'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import Pagination from '@/components/Pagination';
import { adminAPI } from '@/lib/api';
import { Eye, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportToExcel, flattenForExport } from '@/lib/export';

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page) };
      if (statusFilter) params.status = statusFilter;
      const res = await adminAPI.getBookings(params);
      setBookings(res.data.data.bookings);
      setTotalPages(res.data.data.pagination?.pages || 1);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to load bookings'); } finally { setLoading(false); }
  };

  useEffect(() => { setPage(1); }, [statusFilter]);
  useEffect(() => { fetchBookings(); }, [statusFilter, page]);

  const columns = [
    { key: 'userId', label: 'Customer', render: (v: any) => v?.name || 'N/A' },
    { key: 'serviceId', label: 'Service', render: (v: any) => v?.name || 'N/A' },
    { key: 'carId', label: 'Car', render: (v: any) => v ? `${v.make} ${v.model}` : 'N/A' },
    { key: 'partnerId', label: 'Partner', render: (v: any) => v?.name || 'Unassigned' },
    { key: 'slotDate', label: 'Date', render: (v: string, row: any) => `${new Date(v).toLocaleDateString('en-IN')} ${row.slotTime}` },
    { key: 'finalAmount', label: 'Amount', render: (v: number) => `₹${v}` },
    { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
    { key: '_id', label: '', render: (_: any, row: any) => (
      <button onClick={() => router.push(`/bookings/${row._id}`)} className="p-1 text-gray-500 hover:text-gray-700"><Eye size={16} /></button>
    )},
  ];

  return (
    <AdminLayout title="Booking Management">
      <div className="mb-6 flex items-center justify-between">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm">
          <option value="">All Status</option>
          {['awaiting_payment','pending','assigned','accepted','started','in_progress','completed','cancelled'].map(s => (
            <option key={s} value={s} className="capitalize">{s.replace('_',' ')}</option>
          ))}
        </select>
        <button
          onClick={() => exportToExcel(
            flattenForExport(bookings, [
              { key: '_id', label: 'Booking ID' },
              { key: 'userId.name', label: 'Customer' },
              { key: 'partnerId.name', label: 'Partner' },
              { key: 'serviceId.name', label: 'Service' },
              { key: 'status', label: 'Status' },
              { key: 'finalAmount', label: 'Amount' },
              { key: 'paymentMethod', label: 'Payment Method' },
              { key: 'slotDate', label: 'Date', transform: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '' },
              { key: 'slotTime', label: 'Time' },
              { key: 'createdAt', label: 'Created', transform: (v) => new Date(v).toLocaleDateString('en-IN') },
            ]),
            'bookings'
          )}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
        >
          <Download size={16} /> Export
        </button>
      </div>
      <DataTable columns={columns} data={bookings} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </AdminLayout>
  );
}
