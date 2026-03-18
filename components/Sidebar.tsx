'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, UserCog, Wrench, ShoppingBag, Tag, Image, Calendar,
  CreditCard, ArrowDownToLine, Bell, Clock, Settings, LogOut, Star,
} from 'lucide-react';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/partners', label: 'Partners', icon: UserCog },
  { href: '/services', label: 'Services', icon: Wrench },
  { href: '/products', label: 'Products', icon: ShoppingBag },
  { href: '/promos', label: 'Promo Codes', icon: Tag },
  { href: '/banners', label: 'Banners', icon: Image },
  { href: '/bookings', label: 'Bookings', icon: Calendar },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/withdrawals', label: 'Withdrawals', icon: ArrowDownToLine },
  { href: '/reviews', label: 'Reviews', icon: Star },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/slots', label: 'Time Slots', icon: Clock },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.href = '/login';
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary">AutoSpark</h1>
        <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium border-r-3 border-primary'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg w-full"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
