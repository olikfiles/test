import { DollarSign, ShoppingBag, TrendingUp, Users } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { label: "Today's Revenue", value: "€1,240.50", icon: <DollarSign className="w-6 h-6 text-emerald-500" /> },
    { label: "Total Orders", value: "42", icon: <ShoppingBag className="w-6 h-6 text-blue-500" /> },
    { label: "Active Customers", value: "128", icon: <Users className="w-6 h-6 text-indigo-500" /> },
    { label: "Growth", value: "+12.5%", icon: <TrendingUp className="w-6 h-6 text-emerald-500" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground mb-8">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-border flex items-center gap-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-border p-6">
          <h2 className="text-xl font-bold text-foreground mb-6">Recent Orders Overview</h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-border rounded-xl text-muted-foreground">
            Chart Placeholder
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
          <h2 className="text-xl font-bold text-foreground mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 rounded-xl text-left font-medium transition-colors border border-border">
              Add New Menu Item
            </button>
            <button className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 rounded-xl text-left font-medium transition-colors border border-border">
              Manage Categories
            </button>
            <button className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 rounded-xl text-left font-medium transition-colors border border-border">
              View Analytics Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
