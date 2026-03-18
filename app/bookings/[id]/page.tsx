'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import StatusBadge from '@/components/StatusBadge';
import { adminAPI } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function BookingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState<any[]>([]);
  const [selectedPartner, setSelectedPartner] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchBooking = () => {
    api.get(`/bookings/${id}`).then((res) => {
      setBooking(res.data.data);
      setLoading(false);
    }).catch((err) => { toast.error(err.response?.data?.message || 'Failed to load booking details'); setLoading(false); });
  };

  useEffect(() => {
    fetchBooking();
    adminAPI.getPartners({ status: 'approved' }).then((res) => {
      setPartners(res.data.data?.partners || []);
    }).catch((err) => { toast.error(err.response?.data?.message || 'Failed to load partners list'); });
  }, [id]);

  const handleCancel = async () => {
    if (!confirm('Cancel this booking?')) return;
    try {
      await adminAPI.cancelBooking(id as string, 'Cancelled by admin');
      toast.success('Booking cancelled');
      router.back();
    } catch { toast.error('Failed'); }
  };

  const handleAssignPartner = async () => {
    if (!selectedPartner) {
      toast.error('Please select a partner');
      return;
    }
    setAssigning(true);
    try {
      await adminAPI.assignPartner(id as string, selectedPartner);
      toast.success('Partner assigned successfully');
      fetchBooking();
    } catch {
      toast.error('Failed to assign partner');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <AdminLayout title="Booking Details">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-6">
        <ArrowLeft size={16} /> Back
      </button>

      {loading ? <p>Loading...</p> : booking ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Booking Info</h3>
              <StatusBadge status={booking.status} />
            </div>
            <InfoRow label="Service" value={booking.serviceId?.name} />
            <InfoRow label="Date" value={new Date(booking.slotDate).toLocaleDateString('en-IN')} />
            <InfoRow label="Time" value={booking.slotTime} />
            <InfoRow label="Amount" value={`₹${booking.amount}`} />
            <InfoRow label="Discount" value={`₹${booking.discount}`} />
            <InfoRow label="Final Amount" value={`₹${booking.finalAmount}`} />
            <InfoRow label="Payment" value={`${booking.paymentMethod?.toUpperCase()} - ${booking.paymentStatus}`} />
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-100 space-y-3">
              <h3 className="text-lg font-semibold">Customer</h3>
              <InfoRow label="Name" value={booking.userId?.name} />
              <InfoRow label="Phone" value={booking.userId?.phone} />
              <InfoRow label="Car" value={booking.carId ? `${booking.carId.make} ${booking.carId.model} (${booking.carId.registrationNo})` : 'N/A'} />
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-100 space-y-3">
              <h3 className="text-lg font-semibold">Partner</h3>
              {booking.partnerId ? (
                <>
                  <InfoRow label="Name" value={booking.partnerId.name} />
                  <InfoRow label="Phone" value={booking.partnerId.phone} />
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-amber-600 font-medium">No partner assigned</p>
                  <select
                    value={selectedPartner}
                    onChange={(e) => setSelectedPartner(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select a partner</option>
                    {partners.map((p: any) => (
                      <option key={p._id} value={p._id}>
                        {p.name} - {p.phone} {p.isOnline ? '(Online)' : '(Offline)'}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignPartner}
                    disabled={assigning || !selectedPartner}
                    className="w-full py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
                  >
                    {assigning ? 'Assigning...' : 'Assign Partner'}
                  </button>
                </div>
              )}
            </div>

            {['pending', 'assigned', 'accepted'].includes(booking.status) && (
              <button onClick={handleCancel} className="w-full py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Cancel Booking</button>
            )}
          </div>
        </div>
      ) : <p className="text-gray-500">Booking not found</p>}
    </AdminLayout>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{value || 'N/A'}</span>
    </div>
  );
}
