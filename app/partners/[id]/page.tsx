'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import StatusBadge from '@/components/StatusBadge';
import { adminAPI } from '@/lib/api';
import { ArrowLeft, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const DOC_TYPES = ['aadhaar', 'pan', 'bankDetails', 'photo', 'drivingLicense'] as const;
const DOC_LABELS: Record<string, string> = {
  aadhaar: 'Aadhaar Card',
  pan: 'PAN Card',
  bankDetails: 'Bank Details',
  photo: 'Photo',
  drivingLicense: 'Driving License',
};

export default function PartnerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [partner, setPartner] = useState<any>(null);
  const [commission, setCommission] = useState('');
  const [minBookings, setMinBookings] = useState('0');
  const [maxBookings, setMaxBookings] = useState('10');
  const [loading, setLoading] = useState(true);
  const [rejectingDoc, setRejectingDoc] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [verifyLoading, setVerifyLoading] = useState<string | null>(null);

  useEffect(() => {
    adminAPI.getPartner(id as string).then((res) => {
      setPartner(res.data.data);
      setCommission(res.data.data.commission.toString());
      setMinBookings((res.data.data.minBookings ?? 0).toString());
      setMaxBookings((res.data.data.maxBookings ?? 10).toString());
      setLoading(false);
    }).catch((err) => { toast.error(err.response?.data?.message || 'Failed to load partner details'); setLoading(false); });
  }, [id]);

  const updateBookingLimits = async () => {
    try {
      const min = parseInt(minBookings);
      const max = parseInt(maxBookings);
      if (isNaN(min) || min < 0 || isNaN(max) || max < 1) {
        return toast.error('Min must be >= 0 and Max must be >= 1');
      }
      if (min > max) {
        return toast.error('Min cannot be greater than Max');
      }
      await adminAPI.updatePartnerBookingLimits(id as string, { minBookings: min, maxBookings: max });
      toast.success('Booking limits updated');
    } catch {
      toast.error('Failed to update booking limits');
    }
  };

  const updateCommission = async () => {
    try {
      await adminAPI.updatePartnerCommission(id as string, parseInt(commission));
      toast.success('Commission updated');
    } catch {
      toast.error('Failed to update');
    }
  };

  const updateStatus = async (status: string) => {
    try {
      await adminAPI.updatePartnerStatus(id as string, status);
      setPartner((prev: any) => ({ ...prev, status }));
      toast.success(`Partner ${status}`);
    } catch {
      toast.error('Failed to update');
    }
  };

  const verifyDocument = async (docType: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
      setVerifyLoading(docType);
      const data: { status: string; rejectionReason?: string } = { status };
      if (status === 'rejected' && reason) data.rejectionReason = reason;
      const res = await adminAPI.verifyPartnerDocument(id as string, docType, data);
      setPartner(res.data.data);
      setRejectingDoc(null);
      setRejectionReason('');
      toast.success(`${DOC_LABELS[docType]} ${status}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to verify document');
    } finally {
      setVerifyLoading(null);
    }
  };

  return (
    <AdminLayout title="Partner Details">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 mb-6">
        <ArrowLeft size={16} /> Back to Partners
      </button>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : partner ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Partner Information</h3>
            <div className="space-y-3">
              <InfoRow label="Name" value={partner.name} />
              <InfoRow label="Email" value={partner.email} />
              <InfoRow label="Phone" value={partner.phone} />
              <InfoRow label="City" value={partner.city || 'N/A'} />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <StatusBadge status={partner.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">KYC Status</span>
                <StatusBadge status={partner.kycStatus || 'not_submitted'} />
              </div>
              <InfoRow label="Online" value={partner.isOnline ? 'Yes' : 'No'} />
            </div>

            <div className="mt-4 flex gap-2">
              {partner.status === 'pending' && (
                <>
                  <button onClick={() => updateStatus('approved')} className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg">Approve</button>
                  <button onClick={() => updateStatus('rejected')} className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg">Reject</button>
                </>
              )}
              {partner.status === 'approved' && (
                <button onClick={() => updateStatus('suspended')} className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg">Suspend</button>
              )}
              {partner.status === 'suspended' && (
                <button onClick={() => updateStatus('approved')} className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg">Reactivate</button>
              )}
            </div>
          </div>

          {/* Stats & Commission */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Earnings & Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500">Total Bookings</p>
                  <p className="text-xl font-bold">{partner.totalBookings}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500">Total Earnings</p>
                  <p className="text-xl font-bold">₹{partner.totalEarnings?.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500">Wallet Balance</p>
                  <p className="text-xl font-bold">₹{partner.walletBalance?.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500">Service Radius</p>
                  <p className="text-xl font-bold">{partner.serviceRadius} km</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Commission</h3>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm"
                  min="0"
                  max="100"
                />
                <button onClick={updateCommission} className="px-4 py-2 bg-primary text-white text-sm rounded-lg">
                  Update
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Booking Limits</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Min Bookings</label>
                  <input
                    type="number"
                    value={minBookings}
                    onChange={(e) => setMinBookings(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Max Bookings</label>
                  <input
                    type="number"
                    value={maxBookings}
                    onChange={(e) => setMaxBookings(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
                    min="1"
                  />
                </div>
                <button onClick={updateBookingLimits} className="w-full px-4 py-2 bg-primary text-white text-sm rounded-lg">
                  Update Limits
                </button>
              </div>
            </div>
          </div>

          {/* KYC Documents - Full Width */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">KYC Documents</h3>
              <StatusBadge status={partner.kycStatus || 'not_submitted'} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {DOC_TYPES.map((docType) => {
                const doc = partner.documents?.[docType];
                const docStatus = doc?.status || 'not_uploaded';
                const docUrl = doc?.url || '';
                const isRejectingThis = rejectingDoc === docType;

                return (
                  <div key={docType} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">{DOC_LABELS[docType]}</span>
                      <StatusBadge status={docStatus} />
                    </div>

                    {docUrl ? (
                      <a
                        href={docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-primary hover:underline mb-3"
                      >
                        <ExternalLink size={14} /> View Document
                      </a>
                    ) : (
                      <p className="text-sm text-gray-400 mb-3">Not uploaded</p>
                    )}

                    {docStatus === 'rejected' && doc?.rejectionReason && (
                      <p className="text-xs text-red-600 bg-red-50 p-2 rounded mb-3">
                        Reason: {doc.rejectionReason}
                      </p>
                    )}

                    {docStatus === 'uploaded' && partner.kycStatus === 'submitted' && (
                      <>
                        {isRejectingThis ? (
                          <div className="space-y-2">
                            <textarea
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Enter rejection reason..."
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => verifyDocument(docType, 'rejected', rejectionReason)}
                                disabled={!rejectionReason.trim() || verifyLoading === docType}
                                className="flex-1 px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg disabled:opacity-50"
                              >
                                Confirm Reject
                              </button>
                              <button
                                onClick={() => { setRejectingDoc(null); setRejectionReason(''); }}
                                className="px-3 py-1.5 border border-gray-200 text-xs rounded-lg"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => verifyDocument(docType, 'approved')}
                              disabled={verifyLoading === docType}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg disabled:opacity-50"
                            >
                              <CheckCircle size={14} /> Approve
                            </button>
                            <button
                              onClick={() => setRejectingDoc(docType)}
                              disabled={verifyLoading === docType}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg disabled:opacity-50"
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-gray-500">Partner not found</div>
      )}
    </AdminLayout>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value}</span>
    </div>
  );
}
