'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import Pagination from '@/components/Pagination';
import { adminAPI } from '@/lib/api';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORY_OPTIONS = [
  'shampoo',
  'polish',
  'wax',
  'interior',
  'accessories',
  'general',
];

const defaultForm = {
  name: '',
  description: '',
  price: '',
  mrp: '',
  image: '',
  category: 'general',
  brand: '',
  inStock: true,
  rating: '',
  isActive: true,
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [form, setForm] = useState({ ...defaultForm });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getProducts({ page: String(page) });
      setProducts(res.data.data.products);
      setTotalPages(res.data.data.pagination?.pages || 1);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const openCreate = () => {
    setEditingProduct(null);
    setForm({ ...defaultForm });
    setShowModal(true);
  };

  const openEdit = (product: any) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      mrp: product.mrp?.toString() || '',
      image: product.image || '',
      category: product.category || 'general',
      brand: product.brand || '',
      inStock: product.inStock ?? true,
      rating: product.rating?.toString() || '',
      isActive: product.isActive ?? true,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data: any = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        image: form.image,
        category: form.category,
        brand: form.brand,
        inStock: form.inStock,
        isActive: form.isActive,
      };
      if (form.mrp) data.mrp = Number(form.mrp);
      if (form.rating) data.rating = Number(form.rating);

      if (editingProduct) {
        await adminAPI.updateProduct(editingProduct._id, data);
        toast.success('Product updated');
      } else {
        await adminAPI.createProduct(data);
        toast.success('Product created');
      }
      setShowModal(false);
      fetchProducts();
    } catch {
      toast.error('Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await adminAPI.deleteProduct(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleToggleActive = async (product: any) => {
    try {
      await adminAPI.updateProduct(product._id, { isActive: !product.isActive });
      fetchProducts();
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleToggleStock = async (product: any) => {
    try {
      await adminAPI.updateProduct(product._id, { inStock: !product.inStock });
      fetchProducts();
    } catch {
      toast.error('Failed to update');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (v: string, row: any) => (
        <div className="flex items-center gap-3">
          {row.image ? (
            <img src={row.image} alt={v} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
              No img
            </div>
          )}
          <div>
            <p className="font-medium text-gray-800">{v}</p>
            {row.brand && <p className="text-xs text-gray-500">{row.brand}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (v: string) => <span className="capitalize text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-full">{v}</span>,
    },
    {
      key: 'price',
      label: 'Price',
      render: (v: number, row: any) => (
        <div>
          <span className="font-semibold">₹{v}</span>
          {row.mrp && row.mrp > v && (
            <span className="text-xs text-gray-400 line-through ml-2">₹{row.mrp}</span>
          )}
        </div>
      ),
    },
    {
      key: 'inStock',
      label: 'Stock',
      render: (v: boolean, row: any) => (
        <button
          onClick={() => handleToggleStock(row)}
          className={`text-xs px-3 py-1 rounded-full font-medium ${v ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
        >
          {v ? 'In Stock' : 'Out of Stock'}
        </button>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (v: boolean, row: any) => (
        <button
          onClick={() => handleToggleActive(row)}
          className={`text-xs px-3 py-1 rounded-full font-medium ${v ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
        >
          {v ? 'Active' : 'Inactive'}
        </button>
      ),
    },
    {
      key: '_id',
      label: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-lg">
            Edit
          </button>
          <button onClick={() => handleDelete(row._id)} className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-lg">
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Product Management">
      <div className="flex justify-end mb-6">
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-lg">
          <Plus size={16} /> Add Product
        </button>
      </div>
      <DataTable columns={columns} data={products} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingProduct ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Product Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
            required
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
            rows={3}
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Price (₹)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
              required
              min="0"
            />
            <input
              type="number"
              placeholder="MRP (₹)"
              value={form.mrp}
              onChange={(e) => setForm({ ...form, mrp: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
              min="0"
            />
          </div>
          <input
            type="text"
            placeholder="Image URL"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
          />
          <div className="grid grid-cols-2 gap-4">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Brand"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <input
            type="number"
            placeholder="Rating (0-5)"
            value={form.rating}
            onChange={(e) => setForm({ ...form, rating: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
            min="0"
            max="5"
            step="0.1"
          />
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.inStock}
                onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                className="w-4 h-4 text-primary rounded border-gray-300"
              />
              In Stock
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 text-primary rounded border-gray-300"
              />
              Active
            </label>
          </div>
          <button type="submit" className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium">
            {editingProduct ? 'Update' : 'Create'} Product
          </button>
        </form>
      </Modal>
    </AdminLayout>
  );
}
