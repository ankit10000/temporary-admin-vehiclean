'use client';
import { useEffect, useState } from 'react';
import { Users, UserCog, Calendar, DollarSign, Clock, AlertCircle, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import AdminLayout from '@/components/AdminLayout';
import StatsCard from '@/components/StatsCard';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalUsers: number;
  totalPartners: number;
  totalBookings: number;
  totalRevenue: number;
  todayBookings: number;
  pendingPartners: number;
  activeBookings: number;
}

interface Analytics {
  bookingTrend: { date: string; count: number }[];
  revenueTrend: { date: string; revenue: number }[];
  statusBreakdown: { status: string; count: number }[];
  topPartners: { name: string; totalEarnings: number; averageRating: number; totalReviews: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  assigned: '#3B82F6',
  accepted: '#8B5CF6',
  started: '#6366F1',
  in_progress: '#06B6D4',
  completed: '#10B981',
  cancelled: '#EF4444',
};

const PIE_COLORS = ['#F59E0B', '#3B82F6', '#8B5CF6', '#6366F1', '#06B6D4', '#10B981', '#EF4444'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminAPI.dashboard(),
      adminAPI.analytics(),
    ]).then(([dashRes, analyticsRes]) => {
      setStats(dashRes.data.data);
      setAnalytics(analyticsRes.data.data);
    }).catch((err) => {
      toast.error(err.response?.data?.message || 'Failed to load dashboard');
    }).finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>
      ) : stats ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard title="Total Users" value={stats.totalUsers} icon={Users} color="bg-blue-500" />
            <StatsCard title="Total Partners" value={stats.totalPartners} icon={UserCog} color="bg-purple-500" />
            <StatsCard title="Total Bookings" value={stats.totalBookings} icon={Calendar} color="bg-green-500" />
            <StatsCard title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`} icon={DollarSign} color="bg-orange-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard title="Today's Bookings" value={stats.todayBookings} icon={Clock} color="bg-indigo-500" />
            <StatsCard title="Pending Partners" value={stats.pendingPartners} icon={AlertCircle} color="bg-yellow-500" />
            <StatsCard title="Active Bookings" value={stats.activeBookings} icon={Activity} color="bg-teal-500" />
          </div>

          {/* Charts */}
          {analytics && (
            <>
              {/* Booking Trend + Revenue Trend */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Booking Trend (30 days)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.bookingTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(d) => d.slice(5)} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#52277E" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Revenue Trend (30 days)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.revenueTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(d) => d.slice(5)} />
                      <YAxis tickFormatter={(v) => `₹${v}`} />
                      <Tooltip formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, 'Revenue']} />
                      <Bar dataKey="revenue" fill="#F07E0D" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Status Breakdown + Top Partners */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Booking Status Breakdown</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.statusBreakdown}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="count"
                        nameKey="status"
                        label={({ status, count }) => `${status}: ${count}`}
                      >
                        {analytics.statusBreakdown.map((entry, i) => (
                          <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Top Partners by Earnings</h3>
                  <div className="space-y-4">
                    {analytics.topPartners.map((p, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-sm text-gray-500">
                            {p.averageRating > 0 ? `${p.averageRating.toFixed(1)}★ (${p.totalReviews} reviews)` : 'No reviews'}
                          </p>
                        </div>
                        <p className="font-semibold text-green-600">₹{p.totalEarnings.toLocaleString('en-IN')}</p>
                      </div>
                    ))}
                    {analytics.topPartners.length === 0 && (
                      <p className="text-gray-400 text-center py-8">No partner data yet</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <p className="text-gray-500">Failed to load dashboard</p>
      )}
    </AdminLayout>
  );
}
