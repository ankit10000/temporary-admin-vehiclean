'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Ticket {
  _id: string;
  userId: { name: string; email: string; phone: string } | null;
  subject: string;
  description: string;
  category: string;
  status: string;
  adminReply: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-yellow-50 text-yellow-700',
  in_progress: 'bg-blue-50 text-blue-700',
  resolved: 'bg-green-50 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filter) params.status = filter;
      const res = await adminAPI.getTickets(params);
      setTickets(res.data.data || []);
    } catch { toast.error('Failed to load tickets'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTickets(); }, [filter]);

  const openReply = (ticket: Ticket) => {
    setSelected(ticket);
    setReply(ticket.adminReply || '');
    setStatus(ticket.status);
    setShowModal(true);
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    try {
      await adminAPI.replyTicket(selected._id, { adminReply: reply, status });
      toast.success('Ticket updated');
      setShowModal(false);
      fetchTickets();
    } catch { toast.error('Failed to update'); }
  };

  const columns = [
    { key: 'userId', label: 'User', render: (v: any) => v?.name || 'Deleted' },
    { key: 'subject', label: 'Subject', render: (v: string) => <span className="font-medium truncate max-w-[180px] block">{v}</span> },
    { key: 'category', label: 'Category', render: (v: string) => <span className="capitalize text-xs font-medium px-2 py-1 bg-purple-50 text-purple-700 rounded">{v}</span> },
    {
      key: 'status', label: 'Status',
      render: (v: string) => (
        <span className={`text-xs font-medium px-2 py-1 rounded capitalize ${STATUS_COLORS[v] || 'bg-gray-100 text-gray-600'}`}>
          {v.replace('_', ' ')}
        </span>
      ),
    },
    { key: 'createdAt', label: 'Created', render: (v: string) => new Date(v).toLocaleDateString('en-IN') },
    {
      key: '_id', label: 'Action',
      render: (_: string, row: any) => (
        <button onClick={() => openReply(row)} className="text-xs text-primary hover:underline font-medium">View / Reply</button>
      ),
    },
  ];

  return (
    <AdminLayout title="Support Tickets">
      <div className="flex gap-2 mb-6">
        {['', 'open', 'in_progress', 'resolved', 'closed'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border ${filter === s ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
          >
            {s ? s.replace('_', ' ').replace(/^\w/, c => c.toUpperCase()) : 'All'}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={tickets} loading={loading} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Support Ticket">
        {selected && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">User</p>
              <p className="text-sm font-medium">{selected.userId?.name} ({selected.userId?.email})</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Subject</p>
              <p className="text-sm font-semibold">{selected.subject}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selected.description}</p>
            </div>
            <form onSubmit={handleReply} className="space-y-3 border-t pt-4">
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <textarea placeholder="Admin reply..." value={reply} onChange={(e) => setReply(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm" rows={4} />
              <button type="submit" className="w-full py-2 bg-primary text-white rounded-lg text-sm font-medium">Update Ticket</button>
            </form>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}
