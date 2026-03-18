'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import StatusBadge from '@/components/StatusBadge';
import Pagination from '@/components/Pagination';
import { adminAPI } from '@/lib/api';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PromosPage() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ code: '', discountType: 'flat', discountValue: '', minOrder: '0', maxDiscount: '0', maxUses: '0', validFrom: '', validTo: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getPromos({ page: String(page) });
      setPromos(res.data.data.promos);
      setTotalPages(res.data.data.pagination?.pages || 1);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to load promo codes'); } finally { setLoading(false); }
  };
  useEffect(() => { fetchPromos(); }, [page]);

  const openCreate = () => { setEditing(null); setForm({ code: '', discountType: 'flat', discountValue: '', minOrder: '0', maxDiscount: '0', maxUses: '0', validFrom: '', validTo: '' }); setShowModal(true); };
  const openEdit = (p: any) => { setEditing(p); setForm({ code: p.code, discountType: p.discountType, discountValue: p.discountValue.toString(), minOrder: p.minOrder.toString(), maxDiscount: (p.maxDiscount||0).toString(), maxUses: p.maxUses.toString(), validFrom: p.validFrom?.split('T')[0]||'', validTo: p.validTo?.split('T')[0]||'' }); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form, discountValue: Number(form.discountValue), minOrder: Number(form.minOrder), maxDiscount: Number(form.maxDiscount), maxUses: Number(form.maxUses) };
      if (editing) { await adminAPI.updatePromo(editing._id, data); toast.success('Updated'); }
      else { await adminAPI.createPromo(data); toast.success('Created'); }
      setShowModal(false); fetchPromos();
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id: string) => { if (!confirm('Delete?')) return; try { await adminAPI.deletePromo(id); fetchPromos(); toast.success('Deleted'); } catch { toast.error('Failed'); } };

  const columns = [
    { key: 'code', label: 'Code', render: (v: string) => <span className="font-mono font-medium">{v}</span> },
    { key: 'discountType', label: 'Type', render: (v: string) => <span className="capitalize">{v}</span> },
    { key: 'discountValue', label: 'Value', render: (v: number, row: any) => row.discountType === 'flat' ? `₹${v}` : `${v}%` },
    { key: 'usedCount', label: 'Used', render: (v: number, row: any) => `${v}/${row.maxUses || '∞'}` },
    { key: 'validTo', label: 'Expires', render: (v: string) => new Date(v).toLocaleDateString('en-IN') },
    { key: 'isActive', label: 'Status', render: (v: boolean) => <StatusBadge status={v ? 'active' : 'inactive'} /> },
    { key: '_id', label: 'Actions', render: (_: any, row: any) => (
      <div className="flex gap-2">
        <button onClick={() => openEdit(row)} className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-lg">Edit</button>
        <button onClick={() => handleDelete(row._id)} className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-lg">Delete</button>
      </div>
    )},
  ];

  return (
    <AdminLayout title="Promo Code Management">
      <div className="flex justify-end mb-6">
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-lg"><Plus size={16} /> Add Promo</button>
      </div>
      <DataTable columns={columns} data={promos} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Promo' : 'Add Promo'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Promo Code" value={form.code} onChange={(e) => setForm({...form, code: e.target.value.toUpperCase()})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm font-mono" required />
          <div className="grid grid-cols-2 gap-4">
            <select value={form.discountType} onChange={(e) => setForm({...form, discountType: e.target.value})} className="px-4 py-2 border border-gray-200 rounded-lg text-sm">
              <option value="flat">Flat (₹)</option><option value="percentage">Percentage (%)</option>
            </select>
            <input type="number" placeholder="Discount Value" value={form.discountValue} onChange={(e) => setForm({...form, discountValue: e.target.value})} className="px-4 py-2 border border-gray-200 rounded-lg text-sm" required />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <input type="number" placeholder="Min Order" value={form.minOrder} onChange={(e) => setForm({...form, minOrder: e.target.value})} className="px-4 py-2 border border-gray-200 rounded-lg text-sm" />
            <input type="number" placeholder="Max Discount" value={form.maxDiscount} onChange={(e) => setForm({...form, maxDiscount: e.target.value})} className="px-4 py-2 border border-gray-200 rounded-lg text-sm" />
            <input type="number" placeholder="Max Uses (0=∞)" value={form.maxUses} onChange={(e) => setForm({...form, maxUses: e.target.value})} className="px-4 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-gray-500">Valid From</label><input type="date" value={form.validFrom} onChange={(e) => setForm({...form, validFrom: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm" required /></div>
            <div><label className="text-xs text-gray-500">Valid To</label><input type="date" value={form.validTo} onChange={(e) => setForm({...form, validTo: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm" required /></div>
          </div>
          <button type="submit" className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium">{editing ? 'Update' : 'Create'}</button>
        </form>
      </Modal>
    </AdminLayout>
  );
}
