'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function SlotsPage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState<any[]>([]);
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayReason, setHolidayReason] = useState('');
  const [loading, setLoading] = useState(false);

  const defaultSlots = () => {
    const s = [];
    for (let h = 8; h <= 19; h++) {
      s.push({ time: `${h.toString().padStart(2, '0')}:00`, maxBookings: 5, currentBookings: 0, isBlocked: false });
    }
    return s;
  };

  useEffect(() => {
    setLoading(true);
    const d = new Date(date);
    adminAPI.getSlots({ month: (d.getMonth() + 1).toString(), year: d.getFullYear().toString() })
      .then((res) => {
        const found = res.data.data.find((s: any) => new Date(s.date).toISOString().split('T')[0] === date);
        if (found) {
          setSlots(found.slots);
          setIsHoliday(found.isHoliday);
          setHolidayReason(found.holidayReason || '');
        } else {
          setSlots(defaultSlots());
          setIsHoliday(false);
          setHolidayReason('');
        }
      }).catch((err) => { toast.error(err.response?.data?.message || 'Failed to load slots'); setSlots(defaultSlots()); })
      .finally(() => setLoading(false));
  }, [date]);

  const toggleSlotBlock = (index: number) => {
    setSlots((prev) => prev.map((s, i) => i === index ? { ...s, isBlocked: !s.isBlocked } : s));
  };

  const updateMaxBookings = (index: number, value: number) => {
    setSlots((prev) => prev.map((s, i) => i === index ? { ...s, maxBookings: value } : s));
  };

  const handleSave = async () => {
    try {
      await adminAPI.updateSlot({ date, slots, isHoliday, holidayReason });
      toast.success('Slots saved');
    } catch { toast.error('Failed'); }
  };

  const totalBookings = slots.reduce((sum, s) => sum + (s.currentBookings || 0), 0);
  const totalCapacity = slots.filter((s) => !s.isBlocked).reduce((sum, s) => sum + (s.maxBookings || 0), 0);

  return (
    <AdminLayout title="Time Slot Management">
      <div className="flex flex-wrap gap-4 items-end mb-6">
        <div>
          <label className="text-sm text-gray-500">Select Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="block mt-1 px-4 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isHoliday} onChange={(e) => setIsHoliday(e.target.checked)} className="rounded" />
          Mark as Holiday
        </label>
        {isHoliday && (
          <input type="text" placeholder="Holiday reason" value={holidayReason} onChange={(e) => setHolidayReason(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm" />
        )}
      </div>

      {/* Summary Cards */}
      {!isHoliday && !loading && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
            <p className="text-xs text-purple-600 font-medium">Total Bookings</p>
            <p className="text-2xl font-bold text-purple-700 mt-1">{totalBookings}</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs text-blue-600 font-medium">Total Capacity</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{totalCapacity}</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
            <p className="text-xs text-green-600 font-medium">Available</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{totalCapacity - totalBookings}</p>
          </div>
        </div>
      )}

      {!isHoliday && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Max Bookings</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Booked</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Available</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {slots.map((slot, i) => {
                const booked = slot.currentBookings || 0;
                const available = slot.isBlocked ? 0 : Math.max(0, slot.maxBookings - booked);
                const isFull = !slot.isBlocked && booked >= slot.maxBookings;

                return (
                  <tr key={i} className={slot.isBlocked ? 'bg-red-50' : isFull ? 'bg-amber-50' : ''}>
                    <td className="px-6 py-3 text-sm font-semibold">{slot.time}</td>
                    <td className="px-6 py-3">
                      <input type="number" value={slot.maxBookings} onChange={(e) => updateMaxBookings(i, parseInt(e.target.value))} className="w-20 px-2 py-1 border border-gray-200 rounded text-sm" min="0" />
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        booked === 0
                          ? 'bg-gray-100 text-gray-500'
                          : isFull
                            ? 'bg-red-100 text-red-700'
                            : 'bg-purple-100 text-purple-700'
                      }`}>
                        {booked}
                        {booked > 0 && <span className="font-normal">/ {slot.maxBookings}</span>}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                        slot.isBlocked
                          ? 'bg-gray-100 text-gray-400'
                          : available === 0
                            ? 'bg-red-100 text-red-600'
                            : available <= 2
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-green-100 text-green-700'
                      }`}>
                        {slot.isBlocked ? '—' : available}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <button onClick={() => toggleSlotBlock(i)} className={`text-xs px-3 py-1 rounded-full font-medium ${slot.isBlocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {slot.isBlocked ? 'Blocked' : 'Open'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <button onClick={handleSave} className="mt-6 px-6 py-2.5 bg-primary text-white text-sm rounded-lg font-medium">Save Changes</button>
    </AdminLayout>
  );
}
