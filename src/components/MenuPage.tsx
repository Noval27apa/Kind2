import { useMemo, useState } from "react";
import { Search, ShoppingCart, UtensilsCrossed, Info } from "lucide-react";
import type { CategoryId, MenuItem } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";
import { formatIDR } from "@/lib/format";
import { ProductDetail } from "./ProductDetail";

interface MenuPageProps {
  menu: MenuItem[];
  tableNumber: string;
  cartCount: number;
  onAddToCart: (item: MenuItem, quantity: number, note: string) => void;
  onOpenCart: () => void;
  onGoCheckout: () => void;
}

export function MenuPage({ menu, tableNumber, cartCount, onAddToCart, onOpenCart, onGoCheckout }: MenuPageProps) {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<CategoryId | "all">("all");
  const [selected, setSelected] = useState<MenuItem | null>(null);

  const filtered = useMemo(() => {
    return menu.filter((m) => {
      const matchesCat = activeCat === "all" || m.category === activeCat;
      const matchesQuery =
        !query ||
        m.name.toLowerCase().includes(query.toLowerCase()) ||
        m.description.toLowerCase().includes(query.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [menu, activeCat, query]);

  const grouped = useMemo(() => {
    if (activeCat !== "all") return null;
    const map = new Map<CategoryId, MenuItem[]>();
    for (const cat of CATEGORIES) {
      const items = filtered.filter((m) => m.category === cat.id);
      if (items.length) map.set(cat.id, items);
    }
    return map;
  }, [filtered, activeCat]);

  return (
    <div className="min-h-screen bg-cream-50 pb-28">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-cream-50/95 backdrop-blur border-b border-cream-200">
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-sage-600 font-semibold">Selamat datang di</p>
              <h1 className="font-display text-2xl text-espresso-900">Kind Comfy Pleasure</h1>
            </div>
            <button
              onClick={onOpenCart}
              className="relative w-11 h-11 rounded-full bg-espresso-800 text-cream-50 flex items-center justify-center shadow-soft hover:bg-espresso-900 transition-colors"
              aria-label="Keranjang"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-sage-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-cream-50">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* Table banner */}
          <div className="mt-3 flex items-center gap-2.5 bg-sage-700 text-cream-50 rounded-2xl px-4 py-2.5">
            <UtensilsCrossed size={18} className="shrink-0 opacity-80" />
            <div className="flex-1 text-sm">
              <span className="opacity-75">Meja Anda: </span>
              <span className="font-semibold">{tableNumber}</span>
            </div>
            <span className="text-xs opacity-60">Pesan langsung dari sini</span>
          </div>

          {/* Search */}
          <div className="mt-3 relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-espresso-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari menu favorit Anda..."
              className="w-full rounded-2xl border border-cream-200 bg-white pl-10 pr-4 py-3 text-sm text-espresso-900 placeholder:text-espresso-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
            />
          </div>

          {/* Category chips */}
          <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
            <CatChip active={activeCat === "all"} onClick={() => setActiveCat("all")} label="Semua" />
            {CATEGORIES.map((c) => (
              <CatChip key={c.id} active={activeCat === c.id} onClick={() => setActiveCat(c.id)} label={c.label} />
            ))}
          </div>
        </div>
      </header>

      {/* Menu list */}
      <main className="max-w-2xl mx-auto px-4 pt-5">
        {filtered.length === 0 && (
          <div className="text-center py-20 text-espresso-500">
            <Info size={32} className="mx-auto mb-3 opacity-40" />
            <p>Menu tidak ditemukan untuk "{query}".</p>
          </div>
        )}

        {grouped ? (
          <div className="space-y-7">
            {CATEGORIES.map((cat) => {
              const items = grouped.get(cat.id);
              if (!items) return null;
              return (
                <section key={cat.id}>
                  <h2 className="font-display text-lg text-espresso-900 mb-3 flex items-center gap-2">
                    {cat.label}
                    <span className="text-xs font-sans text-espresso-400 font-normal">{items.length} item</span>
                  </h2>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <MenuCard key={item.id} item={item} onClick={() => setSelected(item)} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <MenuCard key={item.id} item={item} onClick={() => setSelected(item)} />
            ))}
          </div>
        )}
      </main>

      {/* Sticky checkout bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-30 animate-slide-up">
          <div className="max-w-2xl mx-auto px-4 pb-4">
            <button
              onClick={onGoCheckout}
              className="w-full flex items-center justify-between rounded-2xl bg-espresso-800 text-cream-50 px-5 py-4 shadow-lift hover:bg-espresso-900 transition-colors"
            >
              <span className="flex items-center gap-2 font-semibold">
                <ShoppingCart size={18} />
                {cartCount} item
              </span>
              <span className="font-semibold">Lihat Keranjang</span>
            </button>
          </div>
        </div>
      )}

      <ProductDetail item={selected} onClose={() => setSelected(null)} onAdd={onAddToCart} />
    </div>
  );
}

function CatChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active ? "bg-espresso-800 text-cream-50" : "bg-white text-espresso-700 border border-cream-200 hover:bg-cream-100"
      }`}
    >
      {label}
    </button>
  );
}

function MenuCard({ item, onClick }: { item: MenuItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full text-left bg-white rounded-2xl shadow-soft border border-cream-100 overflow-hidden hover:shadow-card transition-shadow group"
    >
      <div className="relative w-28 h-28 shrink-0 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {!item.available && (
          <div className="absolute inset-0 bg-espresso-900/45 flex items-center justify-center">
            <span className="text-cream-50 text-xs font-semibold bg-espresso-900/70 px-2 py-1 rounded-full">Habis</span>
          </div>
        )}
      </div>
      <div className="flex-1 p-3.5 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="font-display text-base text-espresso-900 leading-snug truncate">{item.name}</h3>
          <p className="text-xs text-espresso-500 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
        </div>
        <div className="font-semibold text-espresso-900 text-sm mt-2">{formatIDR(item.price)}</div>
      </div>
    </button>
  );
}
