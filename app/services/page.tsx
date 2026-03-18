'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import { adminAPI } from '@/lib/api';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', duration: '', category: 'wash' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getServices({ page: String(page) });
      setServices(res.data.data.services);
      setTotalPages(res.data.data.pagination?.pages || 1);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to load services'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchServices(); }, [page]);

  const openCreate = () => {
    setEditingService(null);
    setForm({ name: '', description: '', price: '', duration: '', category: 'wash' });
    setShowModal(true);
  };

  const openEdit = (service: any) => {
    setEditingService(service);
    setForm({ name: service.name, description: service.description, price: service.price.toString(), duration: service.duration.toString(), category: service.category });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = { ...form, price: Number(form.price), duration: Number(form.duration) };
      if (editingService) {
        await adminAPI.updateService(editingService._id, data);
        toast.success('Service updated');
      } else {
        await adminAPI.createService(data);
        toast.success('Service created');
      }
      setShowModal(false);
      fetchServices();
    } catch { toast.error('Failed to save'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    try {
      await adminAPI.deleteService(id);
      toast.success('Service deleted');
      fetchServices();
    } catch { toast.error('Failed to delete'); }
  };

  const handleToggle = async (service: any) => {
    try {
      await adminAPI.updateService(service._id, { isActive: !service.isActive });
      fetchServices();
    } catch { toast.error('Failed to update'); }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category', render: (v: string) => <span className="capitalize">{v}</span> },
    { key: 'price', label: 'Price', render: (v: number) => `₹${v}` },
    { key: 'duration', label: 'Duration', render: (v: number) => `${v} min` },
    { key: 'isActive', label: 'Active', render: (v: boolean, row: any) => (
      <button onClick={() => handleToggle(row)} className={`text-xs px-3 py-1 rounded-full font-medium ${v ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
        {v ? 'Active' : 'Inactive'}
      </button>
    )},
    { key: '_id', label: 'Actions', render: (_: any, row: any) => (
      <div className="flex gap-2">
        <button onClick={() => openEdit(row)} className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-lg">Edit</button>
        <button onClick={() => handleDelete(row._id)} className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-lg">Delete</button>
      </div>
    )},
  ];

  return (
    <AdminLayout title="Service Management">
      <div className="flex justify-end mb-6">
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-lg">
          <Plus size={16} /> Add Service
        </button>
      </div>
      <DataTable columns={columns} data={services} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingService ? 'Edit Service' : 'Add Service'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Service Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm" required />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm" rows={3} />
          <div className="grid grid-cols-2 gap-4">
            <input type="number" placeholder="Price (₹)" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm" required />
            <input type="number" placeholder="Duration (min)" value={form.duration} onChange={(e) => setForm({...form, duration: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm" required />
          </div>
          <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="wash">Wash</option>
            <option value="detailing">Detailing</option>
            <option value="premium">Premium</option>
            <option value="general">General</option>
          </select>
          <button type="submit" className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium">
            {editingService ? 'Update' : 'Create'} Service
          </button>
        </form>
      </Modal>
    </AdminLayout>
  );
}
