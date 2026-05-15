import { Plus, Edit, Trash2, Image as ImageIcon } from "lucide-react";

const mockMenu = [
  { id: "p1", name: "Margherita Royale", category: "Pizzas", price: 22.00, available: true, hasImage: true },
  { id: "p2", name: "Truffle & Gold", category: "Pizzas", price: 45.00, available: true, hasImage: true },
  { id: "b1", name: "The Wagyu Reserve", category: "Burgers", price: 55.00, available: true, hasImage: false },
  { id: "s1", name: "Beluga Caviar", category: "Caviars & Small Plates", price: 180.00, available: true, hasImage: true },
];

export default function MenuManager() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-foreground">Menu Manager</h1>
        <button className="px-6 py-3 bg-primary text-white font-bold rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm">
          <Plus className="w-5 h-5" /> Add New Item
        </button>
      </div>

      <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-foreground">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-widest text-xs w-16">Media</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-widest text-xs">Name</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-widest text-xs">Category</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-widest text-xs">Price</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-widest text-xs">Status</th>
                <th className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-widest text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockMenu.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-muted-foreground border border-border overflow-hidden">
                      {item.hasImage ? <img src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=100&auto=format&fit=crop" className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-foreground">{item.name}</td>
                  <td className="px-6 py-4 text-muted-foreground text-sm tracking-wider uppercase">{item.category}</td>
                  <td className="px-6 py-4 font-medium text-foreground">€{item.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold ${
                      item.available ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                    }`}>
                      {item.available ? "Available" : "Sold Out"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/5">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-muted-foreground hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/5">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
