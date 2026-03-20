'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Modal from '@/components/Modal';
import { adminAPI } from '@/lib/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
}

const emptyForm = { question: '', answer: '', category: 'General', order: 0, isActive: true };

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchFAQs = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getFAQs();
      setFaqs(res.data.data || []);
    } catch { toast.error('Failed to load FAQs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFAQs(); }, []);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (faq: FAQ) => {
    setEditId(faq._id);
    setForm({ question: faq.question, answer: faq.answer, category: faq.category, order: faq.order, isActive: faq.isActive });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await adminAPI.updateFAQ(editId, form);
        toast.success('FAQ updated');
      } else {
        await adminAPI.createFAQ(form);
        toast.success('FAQ created');
      }
      setShowModal(false);
      fetchFAQs();
    } catch { toast.error('Failed to save FAQ'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return;
    try {
      await adminAPI.deleteFAQ(id);
      toast.success('FAQ deleted');
      fetchFAQs();
    } catch { toast.error('Failed'); }
  };

  return (
    <AdminLayout title="FAQs">
      <div className="flex justify-end mb-6">
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-lg">
          <Plus size={16} /> Add FAQ
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : faqs.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No FAQs yet</div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq._id} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium px-2 py-0.5 bg-purple-50 text-purple-700 rounded">{faq.category}</span>
                    {!faq.isActive && <span className="text-xs font-medium px-2 py-0.5 bg-red-50 text-red-600 rounded">Inactive</span>}
                    <span className="text-xs text-gray-400">Order: {faq.order}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{faq.question}</h3>
                  <p className="text-gray-500 text-sm mt-1">{faq.answer}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => openEdit(faq)} className="p-2 hover:bg-gray-50 rounded-lg"><Pencil size={14} className="text-gray-400" /></button>
                  <button onClick={() => handleDelete(faq._id)} className="p-2 hover:bg-red-50 rounded-lg"><Trash2 size={14} className="text-red-400" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit FAQ' : 'Add FAQ'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Category" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="px-4 py-2 border border-gray-200 rounded-lg text-sm" />
            <input type="number" placeholder="Order" value={form.order} onChange={(e) => setForm({...form, order: Number(e.target.value)})} className="px-4 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <input type="text" placeholder="Question" value={form.question} onChange={(e) => setForm({...form, question: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm" required />
          <textarea placeholder="Answer" value={form.answer} onChange={(e) => setForm({...form, answer: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm" rows={4} required />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({...form, isActive: e.target.checked})} />
            Active
          </label>
          <button type="submit" className="w-full py-2 bg-primary text-white rounded-lg text-sm font-medium">{editId ? 'Update' : 'Create'} FAQ</button>
        </form>
      </Modal>
    </AdminLayout>
  );
}
