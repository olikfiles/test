const orders = {
  new: [
    { id: "#1042", type: "Delivery", items: ["1x Smash Burger", "1x Cola"], total: 19.40, time: "2m ago" },
    { id: "#1043", type: "Pickup", items: ["2x Truffle Pizza"], total: 37.00, time: "Just now" },
  ],
  preparing: [
    { id: "#1040", type: "Dine-In", items: ["1x Margherita", "1x Beyond Burger"], total: 27.00, time: "12m ago" },
  ],
  ready: [
    { id: "#1038", type: "Delivery", items: ["1x Spicy Vodka Rigatoni"], total: 16.00, time: "25m ago" },
  ]
};

function OrderCard({ order }: { order: any }) {
  const typeColor = 
    order.type === 'Delivery' ? 'bg-blue-100 text-blue-700' :
    order.type === 'Pickup' ? 'bg-purple-100 text-purple-700' :
    'bg-orange-100 text-orange-700';

  return (
    <div className="bg-white p-4 rounded-xl border border-border shadow-sm cursor-grab active:cursor-grabbing hover:border-slate-300 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <span className="font-extrabold text-foreground">{order.id}</span>
        <span className="text-xs font-medium text-muted-foreground">{order.time}</span>
      </div>
      <div className="mb-3">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${typeColor}`}>
          {order.type}
        </span>
      </div>
      <ul className="text-sm font-medium text-slate-600 space-y-1 mb-4">
        {order.items.map((item: string, i: number) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <div className="flex justify-between items-center pt-3 border-t border-border">
        <span className="font-extrabold text-foreground">€{order.total.toFixed(2)}</span>
      </div>
    </div>
  );
}

export default function OrdersKanban() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Live Orders</h1>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-medium text-slate-500">Auto-updating</span>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 snap-x">
        {/* New */}
        <div className="flex-shrink-0 w-80 flex flex-col snap-center">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-bold text-slate-700">New</h3>
            <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2 py-1 rounded-full">{orders.new.length}</span>
          </div>
          <div className="flex-1 bg-slate-100 rounded-2xl p-4 space-y-4 overflow-y-auto">
            {orders.new.map((o) => <OrderCard key={o.id} order={o} />)}
          </div>
        </div>

        {/* Preparing */}
        <div className="flex-shrink-0 w-80 flex flex-col snap-center">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-bold text-amber-700">Preparing</h3>
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">{orders.preparing.length}</span>
          </div>
          <div className="flex-1 bg-amber-50/50 rounded-2xl p-4 space-y-4 border border-amber-100 overflow-y-auto">
            {orders.preparing.map((o) => <OrderCard key={o.id} order={o} />)}
          </div>
        </div>

        {/* Ready */}
        <div className="flex-shrink-0 w-80 flex flex-col snap-center">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-bold text-emerald-700">Ready</h3>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">{orders.ready.length}</span>
          </div>
          <div className="flex-1 bg-emerald-50/50 rounded-2xl p-4 space-y-4 border border-emerald-100 overflow-y-auto">
            {orders.ready.map((o) => <OrderCard key={o.id} order={o} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
