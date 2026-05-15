import Link from "next/link";
import { ReactNode } from "react";
import { LayoutDashboard, UtensilsCrossed, ListOrdered, Settings, LogOut } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 w-full absolute inset-0 z-50">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-white font-bold text-xl tracking-tight">SYÖ & JUO</h2>
          <p className="text-xs text-slate-500 mt-1">Admin Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/admin/menu" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <UtensilsCrossed className="w-5 h-5" /> Menu Manager
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <ListOrdered className="w-5 h-5" /> Orders Kanban
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <Settings className="w-5 h-5" /> Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 text-red-400 hover:text-red-300 transition-colors">
            <LogOut className="w-5 h-5" /> Exit Admin
          </Link>
        </div>
      </aside>

      {/* Admin Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-border flex items-center px-8 shadow-sm">
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xs">
              AD
            </div>
            <span className="font-medium text-sm text-foreground">Admin User</span>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
