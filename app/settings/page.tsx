'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    supportPhone: '',
    supportEmail: '',
    cancellationCharges: 0,
    defaultCommission: 20,
    maintenanceMode: false,
    termsUrl: '',
    privacyUrl: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getSettings().then((res) => {
      setSettings(res.data.data);
      setLoading(false);
    }).catch((err) => { toast.error(err.response?.data?.message || 'Failed to load settings'); setLoading(false); });
  }, []);

  const handleSave = async () => {
    try {
      await adminAPI.updateSettings(settings);
      toast.success('Settings saved');
    } catch { toast.error('Failed'); }
  };

  return (
    <AdminLayout title="App Settings">
      {loading ? <p>Loading...</p> : (
        <div className="max-w-2xl space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Support Phone</label>
                <input type="text" value={settings.supportPhone} onChange={(e) => setSettings({...settings, supportPhone: e.target.value})} className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Support Email</label>
                <input type="email" value={settings.supportEmail} onChange={(e) => setSettings({...settings, supportEmail: e.target.value})} className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Business</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Cancellation Charges (₹)</label>
                <input type="number" value={settings.cancellationCharges} onChange={(e) => setSettings({...settings, cancellationCharges: Number(e.target.value)})} className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Default Commission (%)</label>
                <input type="number" value={settings.defaultCommission} onChange={(e) => setSettings({...settings, defaultCommission: Number(e.target.value)})} className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg text-sm" min="0" max="100" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">App</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={settings.maintenanceMode} onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})} className="rounded" />
                <span className="text-sm text-gray-700">Maintenance Mode</span>
              </label>
              <div>
                <label className="text-sm text-gray-600">Terms & Conditions URL</label>
                <input type="text" value={settings.termsUrl} onChange={(e) => setSettings({...settings, termsUrl: e.target.value})} className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-sm text-gray-600">Privacy Policy URL</label>
                <input type="text" value={settings.privacyUrl} onChange={(e) => setSettings({...settings, privacyUrl: e.target.value})} className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
            </div>
          </div>

          <button onClick={handleSave} className="px-6 py-2.5 bg-primary text-white text-sm rounded-lg font-medium">Save Settings</button>
        </div>
      )}
    </AdminLayout>
  );
}
