'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AdminLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.replace('/login');
    } else {
      setMounted(true);
    }
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Topbar title={title} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
