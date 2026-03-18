'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import DataTable from '@/components/DataTable';
import Pagination from '@/components/Pagination';
import { adminAPI } from '@/lib/api';
import { Trash2, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page) };
      if (ratingFilter) params.rating = ratingFilter;
      const res = await adminAPI.getReviews(params);
      setReviews(res.data.data.reviews);
      setTotalPages(res.data.data.pagination?.pages || 1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { setPage(1); }, [ratingFilter]);
  useEffect(() => { fetchReviews(); }, [ratingFilter, page]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review? Partner rating will be recalculated.')) return;
    try {
      await adminAPI.deleteReview(id);
      toast.success('Review deleted');
      fetchReviews();
    } catch {
      toast.error('Failed to delete review');
    }
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
        />
      ))}
      <span className="ml-1 text-sm font-medium text-gray-700">{rating}</span>
    </div>
  );

  const columns = [
    {
      key: 'userId',
      label: 'Customer',
      render: (v: any) => v?.name || 'N/A',
    },
    {
      key: 'partnerId',
      label: 'Partner',
      render: (v: any) => v?.name || 'N/A',
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (v: number) => renderStars(v),
    },
    {
      key: 'comment',
      label: 'Comment',
      render: (v: string) => (
        <span className="text-sm text-gray-600 max-w-xs truncate block">
          {v || '-'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (v: string) => new Date(v).toLocaleDateString('en-IN'),
    },
    {
      key: '_id',
      label: '',
      render: (_: any, row: any) => (
        <button
          onClick={() => handleDelete(row._id)}
          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
        >
          <Trash2 size={15} />
        </button>
      ),
    },
  ];

  return (
    <AdminLayout title="Review Management">
      <div className="mb-6 flex items-center justify-between">
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm"
        >
          <option value="">All Ratings</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>{r} Stars</option>
          ))}
        </select>
      </div>
      <DataTable columns={columns} data={reviews} loading={loading} />
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </AdminLayout>
  );
}
