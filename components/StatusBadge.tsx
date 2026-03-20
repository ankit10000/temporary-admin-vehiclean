const statusColors: Record<string, string> = {
  awaiting_payment: 'bg-orange-100 text-orange-700',
  pending: 'bg-yellow-100 text-yellow-700',
  assigned: 'bg-blue-100 text-blue-700',
  accepted: 'bg-blue-100 text-blue-700',
  started: 'bg-purple-100 text-purple-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  suspended: 'bg-orange-100 text-orange-700',
  not_submitted: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  verified: 'bg-green-100 text-green-700',
  uploaded: 'bg-blue-100 text-blue-700',
  not_uploaded: 'bg-gray-100 text-gray-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refund_pending: 'bg-orange-100 text-orange-700',
  refunded: 'bg-green-100 text-green-700',
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-700',
};

export default function StatusBadge({ status }: { status: string }) {
  const color = statusColors[status] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
      {status.replace('_', ' ').toUpperCase()}
    </span>
  );
}
