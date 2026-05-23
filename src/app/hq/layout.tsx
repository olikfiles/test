'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ListOrdered, CalendarDays, UtensilsCrossed, LogOut, BookOpen, Tag } from 'lucide-react';
import { ReactNode } from 'react';

function NavLink({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== '/' && pathname.startsWith(href));
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${active
          ? 'bg-primary text-white'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
    >
      {icon}
      {label}
    </Link>
  );
}

export default function AdminShellLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const base = `/hq`;

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push(`${base}/login`);
    router.refresh();
  };

  return (
    <div className="flex h-screen bg-slate-950 w-full absolute inset-0 z-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="px-5 py-6 border-b border-slate-800">
          <p className="font-display font-bold text-white text-lg tracking-widest uppercase">SYÖ & JUO</p>
          <p className="text-slate-500 text-[10px] tracking-[0.15em] uppercase mt-1">Operations</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavLink href={base} label="Dashboard" icon={<LayoutDashboard className="w-4 h-4" />} />
          <NavLink href={`${base}/orders`} label="Orders" icon={<ListOrdered className="w-4 h-4" />} />
          <NavLink href={`${base}/reservations`} label="Reservations" icon={<CalendarDays className="w-4 h-4" />} />
          <div className="h-px bg-slate-800 my-1" />
          <NavLink href={`${base}/menu`} label="Menu" icon={<BookOpen className="w-4 h-4" />} />
          <NavLink href={`${base}/deals`} label="Deals" icon={<Tag className="w-4 h-4" />} />
        </nav>

        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center px-6 shrink-0">
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">syojuo_admin</span>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-[10px]">
              AD
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto bg-slate-950 p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
