'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import Pagination from '@/components/Pagination';
import { adminAPI } from '@/lib/api';
import Modal from '@/components/Modal';
import { Search, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportToExcel, flattenForExport } from '@/lib/export';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({ search, page: String(page) });
      setUsers(res.data.data.users);
      setTotalPages(res.data.data.pagination?.pages || 1);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to load users'); } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(1); }, [search]);
  useEffect(() => { fetchUsers(); }, [search, page]);

  const handleToggleBlock = async (id: string) => {
    try {
      await adminAPI.toggleBlockUser(id);
      fetchUsers();
      toast.success('User status updated');
    } catch {
      toast.error('Failed to update');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'isBlocked',
      label: 'Status',
      render: (val: boolean) => <StatusBadge status={val ? 'suspended' : 'active'} />,
    },
    {
      key: 'createdAt',
      label: 'Joined',
      render: (val: string) => new Date(val).toLocaleDateString('en-IN'),
    },
    {
      key: 'upiId',
      label: 'Payment Info',
      render: (_: any, row: any) => (row.upiId || row.bankDetails?.accountNumber) ? (
        <button onClick={() => setSelectedUser(row)} className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-lg font-medium">View</button>
      ) : <span className="text-xs text-gray-400">Not added</span>,
    },
    {
      key: '_id',
      label: 'Actions',
      render: (_: any, row: any) => (
        <button
          onClick={() => handleToggleBlock(row._id)}
          className={`text-xs px-3 py-1 rounded-lg font-medium ${
            row.isBlocked ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {row.isBlocked ? 'Unblock' : 'Block'}
        </button>
      ),
    },
  ];

  return (
    <AdminLayout title="User Management">
      <div className="mb-6 flex items-center justify-between">
        <div className="relative max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          onClick={() => exportToExcel(
            flattenForExport(users, [
              { key: 'name', label: 'Name' },
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'Phone' },
              { key: 'city', label: 'City' },
              { key: 'isBlocked', label: 'Blocked', transform: (v) => v ? 'Yes' : 'No' },
              { key: 'createdAt', label: 'Joined', transform: (v) => new Date(v).toLocaleDateString('en-IN') },
            ]),
            'users'
          )}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
        >
          <Download size={16} /> Export
        </button>
      </div>
      <DataTable columns={columns} data={users} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title={`Bank & UPI - ${selectedUser?.name || 'User'}`}>
        <div className="space-y-3">
          {selectedUser?.upiId && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <p className="text-xs text-gray-500 mb-1">UPI ID</p>
              <p className="text-sm font-semibold text-gray-800">{selectedUser.upiId}</p>
            </div>
          )}
          {selectedUser?.bankDetails?.accountHolder && (
            <div className="flex justify-between bg-gray-50 rounded-lg p-3">
              <span className="text-sm text-gray-500">Account Holder</span>
              <span className="text-sm font-medium text-gray-800">{selectedUser.bankDetails.accountHolder}</span>
            </div>
          )}
          {selectedUser?.bankDetails?.accountNumber && (
            <div className="flex justify-between bg-gray-50 rounded-lg p-3">
              <span className="text-sm text-gray-500">Account No.</span>
              <span className="text-sm font-medium text-gray-800">{selectedUser.bankDetails.accountNumber}</span>
            </div>
          )}
          {selectedUser?.bankDetails?.ifscCode && (
            <div className="flex justify-between bg-gray-50 rounded-lg p-3">
              <span className="text-sm text-gray-500">IFSC Code</span>
              <span className="text-sm font-medium text-gray-800">{selectedUser.bankDetails.ifscCode}</span>
            </div>
          )}
          {selectedUser?.bankDetails?.bankName && (
            <div className="flex justify-between bg-gray-50 rounded-lg p-3">
              <span className="text-sm text-gray-500">Bank Name</span>
              <span className="text-sm font-medium text-gray-800">{selectedUser.bankDetails.bankName}</span>
            </div>
          )}
          {!selectedUser?.upiId && !selectedUser?.bankDetails?.accountNumber && (
            <p className="text-sm text-gray-400 text-center py-4">No payment details added yet.</p>
          )}
        </div>
      </Modal>
    </AdminLayout>
  );
}
