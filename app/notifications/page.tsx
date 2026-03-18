'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import { adminAPI } from '@/lib/api';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', targetType: 'all' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getNotifications({ page: String(page) });
      setNotifications(res.data.data.notifications);
      setTotalPages(res.data.data.pagination?.pages || 1);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to load notifications'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, [page]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAPI.sendNotification(form);
      toast.success('Notification sent');
      setShowModal(false);
      setForm({ title: '', body: '', targetType: 'all' });
      fetchNotifications();
    } catch { toast.error('Failed'); }
  };

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'body', label: 'Message', render: (v: string) => <span className="truncate max-w-[200px] block">{v}</span> },
    { key: 'targetType', label: 'Target', render: (v: string) => <span className="capitalize text-xs font-medium px-2 py-1 bg-gray-100 rounded">{v}</span> },
    { key: 'sentAt', label: 'Sent At', render: (v: string) => new Date(v).toLocaleString('en-IN') },
  ];

  return (
    <AdminLayout title="Notifications">
      <div className="flex justify-end mb-6">
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-lg"><Send size={16} /> Send Notification</button>
      </div>
      <DataTable columns={columns} data={notifications} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Send Notification">
        <form onSubmit={handleSend} className="space-y-4">
          <input type="text" placeholder="Title" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm" required />
          <textarea placeholder="Message" value={form.body} onChange={(e) => setForm({...form, body: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm" rows={4} required />
          <select value={form.targetType} onChange={(e) => setForm({...form, targetType: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="all">All Users & Partners</option>
            <option value="user">Users Only</option>
            <option value="partner">Partners Only</option>
          </select>
          <button type="submit" className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium">Send</button>
        </form>
      </Modal>
    </AdminLayout>
  );
}
