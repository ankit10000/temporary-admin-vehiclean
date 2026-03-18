'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import { adminAPI } from '@/lib/api';
import { Plus, IndianRupee, Zap, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'home',
    link: '',
    price: '',
    directPayment: false,
    serviceId: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getBanners({ page: String(page) });
      setBanners(res.data.data.banners);
      setTotalPages(res.data.data.pagination?.pages || 1);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to load banners'); } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await adminAPI.getServices({ limit: '100' });
      setServices(res.data.data.services || []);
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to load services'); }
  };

  useEffect(() => {
    fetchBanners();
  }, [page]);

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isOfferPopup = form.type === 'offer' || form.type === 'popup';

    if (isOfferPopup && form.directPayment && !form.serviceId) {
      toast.error('Please select a service for direct payment');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('type', form.type);
      formData.append('link', form.link);
      if (form.description) formData.append('description', form.description);
      if (isOfferPopup) {
        formData.append('price', form.price || '0');
        formData.append('directPayment', String(form.directPayment));
        if (form.serviceId) formData.append('serviceId', form.serviceId);
      }
      if (imageFile) formData.append('image', imageFile);
      await adminAPI.createBanner(formData);
      toast.success('Banner created');
      setShowModal(false);
      setForm({ title: '', description: '', type: 'home', link: '', price: '', directPayment: false, serviceId: '' });
      setImageFile(null);
      fetchBanners();
    } catch {
      toast.error('Failed to create banner');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    try {
      await adminAPI.deleteBanner(id);
      fetchBanners();
      toast.success('Deleted');
    } catch {
      toast.error('Failed');
    }
  };

  const handleToggle = async (banner: any) => {
    try {
      await adminAPI.updateBanner(banner._id, { isActive: !banner.isActive });
      fetchBanners();
    } catch {
      toast.error('Failed');
    }
  };

  const handleToggleDirectPayment = async (banner: any) => {
    try {
      await adminAPI.updateBanner(banner._id, { directPayment: !banner.directPayment });
      fetchBanners();
      toast.success(banner.directPayment ? 'Direct payment disabled' : 'Direct payment enabled');
    } catch {
      toast.error('Failed');
    }
  };

  const isOfferOrPopup = form.type === 'offer' || form.type === 'popup';

  const typeColors: Record<string, string> = {
    home: 'bg-purple-100 text-purple-700',
    offer: 'bg-orange-100 text-orange-700',
    popup: 'bg-blue-100 text-blue-700',
  };

  const columns = [
    {
      key: 'image',
      label: 'Image',
      render: (v: string) =>
        v ? <img src={v} alt="" className="w-20 h-12 object-cover rounded-lg" /> : <span className="text-gray-400 text-xs">No image</span>,
    },
    { key: 'title', label: 'Title' },
    {
      key: 'type',
      label: 'Type',
      render: (v: string) => (
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${typeColors[v] || 'bg-gray-100 text-gray-600'}`}>
          {v}
        </span>
      ),
    },
    {
      key: 'serviceId',
      label: 'Linked Service',
      render: (v: any, row: any) => {
        if (row.type !== 'offer' && row.type !== 'popup') return <span className="text-xs text-gray-400">N/A</span>;
        if (!v) return <span className="text-xs text-gray-400">None</span>;
        return (
          <div>
            <span className="text-xs font-medium text-gray-800">{v.name}</span>
            <span className="text-xs text-gray-400 ml-1">₹{v.price}</span>
          </div>
        );
      },
    },
    {
      key: 'price',
      label: 'Offer Price',
      render: (v: number, row: any) =>
        row.type === 'offer' || row.type === 'popup' ? (
          v > 0 ? (
            <span className="text-sm font-semibold text-green-700">₹{v}</span>
          ) : (
            <span className="text-xs text-gray-400">—</span>
          )
        ) : (
          <span className="text-xs text-gray-400">N/A</span>
        ),
    },
    {
      key: 'directPayment',
      label: 'Direct Pay',
      render: (v: boolean, row: any) => {
        if (row.type !== 'offer' && row.type !== 'popup') {
          return <span className="text-xs text-gray-400">N/A</span>;
        }
        return (
          <button
            onClick={() => handleToggleDirectPayment(row)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              v ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
                v ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        );
      },
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (v: boolean, row: any) => (
        <button
          onClick={() => handleToggle(row)}
          className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
            v ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          {v ? 'Active' : 'Inactive'}
        </button>
      ),
    },
    {
      key: '_id',
      label: 'Actions',
      render: (_: any, row: any) => (
        <button
          onClick={() => handleDelete(row._id)}
          className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <AdminLayout title="Banner Management">
      <div className="flex justify-end mb-6">
        <button
          onClick={() => {
            setForm({ title: '', description: '', type: 'home', link: '', price: '', directPayment: false, serviceId: '' });
            setImageFile(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Add Banner
        </button>
      </div>

      <DataTable columns={columns} data={banners} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Banner">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Banner Title *</label>
            <input
              type="text"
              placeholder="e.g. Flat 50% Off on Premium Wash"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none"
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Banner Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value, price: '', directPayment: false, serviceId: '' })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none"
            >
              <option value="home">Home</option>
              <option value="offer">Offer</option>
              <option value="popup">Popup</option>
            </select>
          </div>

          {/* Description (for offer/popup) */}
          {isOfferOrPopup && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
              <textarea
                placeholder="Describe the offer details..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none resize-none"
                rows={2}
              />
            </div>
          )}

          {/* Pricing & Payment Section (for offer/popup) */}
          {isOfferOrPopup && (
            <div className="bg-purple-50 rounded-xl p-4 space-y-3 border border-purple-100">
              <div className="flex items-center gap-2 mb-1">
                <IndianRupee size={14} className="text-purple-600" />
                <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Pricing & Payment</span>
              </div>

              {/* Link to Service */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1">
                  <Link2 size={12} /> Link to Service {form.directPayment && <span className="text-red-500">*</span>}
                </label>
                <select
                  value={form.serviceId}
                  onChange={(e) => {
                    const sid = e.target.value;
                    const svc = services.find((s: any) => s._id === sid);
                    setForm({
                      ...form,
                      serviceId: sid,
                      price: svc ? String(svc.price) : form.price,
                    });
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none"
                >
                  <option value="">— Select a service —</option>
                  {services.map((s: any) => (
                    <option key={s._id} value={s._id}>
                      {s.name} — ₹{s.price} ({s.duration} min)
                    </option>
                  ))}
                </select>
              </div>

              {/* Offer Price Input */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Offer Price (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none"
                  />
                </div>
                {form.serviceId && (
                  <p className="text-xs text-gray-400 mt-1">
                    Original service price: ₹{services.find((s: any) => s._id === form.serviceId)?.price || 0}
                  </p>
                )}
              </div>

              {/* Direct Payment Toggle */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Direct Payment</p>
                    <p className="text-xs text-gray-400">User can book & pay directly from banner</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, directPayment: !form.directPayment })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    form.directPayment ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
                      form.directPayment ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {form.directPayment && (
                <div className="bg-white rounded-lg p-3 border border-orange-200">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                    <p className="text-xs text-orange-600 font-medium">
                      Flow: User taps &quot;Buy Now ₹{form.price || '0'}&quot; → Select Car → Select Slot → Pay
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Link */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">External Link (optional)</label>
            <input
              type="text"
              placeholder="https://..."
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-400 outline-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Banner Image *</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 file:font-medium file:text-xs hover:file:bg-purple-100 file:cursor-pointer"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Create Banner
          </button>
        </form>
      </Modal>
    </AdminLayout>
  );
}
