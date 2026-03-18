'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import Pagination from '@/components/Pagination';
import { adminAPI } from '@/lib/api';
import { Search, Eye, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportToExcel, flattenForExport } from '@/lib/export';

export default function PartnersPage() {
  const router = useRouter();
  const [partners, setPartners] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page) };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await adminAPI.getPartners(params);
      setPartners(res.data.data.partners);
      setTotalPages(res.data.data.pagination?.pages || 1);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to load partners'); } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(1); }, [search, statusFilter]);
  useEffect(() => { fetchPartners(); }, [search, statusFilter, page]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await adminAPI.updatePartnerStatus(id, status);
      fetchPartners();
      toast.success(`Partner ${status}`);
    } catch {
      toast.error('Failed to update');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'status',
      label: 'Status',
      render: (val: string) => <StatusBadge status={val} />,
    },
    {
      key: 'commission',
      label: 'Commission',
      render: (val: number) => `${val}%`,
    },
    {
      key: '_id',
      label: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/partners/${row._id}`)}
            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-lg"
          >
            <Eye size={14} />
          </button>
          {row.status === 'pending' && (
            <>
              <button
                onClick={() => handleStatusChange(row._id, 'approved')}
                className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-lg font-medium"
              >
                Approve
              </button>
              <button
                onClick={() => handleStatusChange(row._id, 'rejected')}
                className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-lg font-medium"
              >
                Reject
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Partner Management">
      <div className="flex gap-4 mb-6">
        <div className="relative max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search partners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </select>
        <button
          onClick={() => exportToExcel(
            flattenForExport(partners, [
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'Phone' },
              { key: 'city', label: 'City' },
              { key: 'status', label: 'Status' },
              { key: 'commission', label: 'Commission %' },
              { key: 'totalEarnings', label: 'Total Earnings' },
              { key: 'averageRating', label: 'Rating' },
              { key: 'createdAt', label: 'Joined', transform: (v) => new Date(v).toLocaleDateString('en-IN') },
            ]),
            'partners'
          )}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 ml-auto"
        >
          <Download size={16} /> Export
        </button>
      </div>
      <DataTable columns={columns} data={partners} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </AdminLayout>
  );
}
