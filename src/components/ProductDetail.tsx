import { useState } from "react";
import { Minus, Plus, ShoppingBag, Check } from "lucide-react";
import type { MenuItem } from "@/lib/types";
import { formatIDR } from "@/lib/format";
import { Modal } from "./Modal";

interface ProductDetailProps {
  item: MenuItem | null;
  onClose: () => void;
  onAdd: (item: MenuItem, quantity: number, note: string) => void;
}

export function ProductDetail({ item, onClose, onAdd }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [added, setAdded] = useState(false);

  if (!item) return null;

  const handleAdd = () => {
    onAdd(item, quantity, note);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setQuantity(1);
      setNote("");
      onClose();
    }, 700);
  };

  const unavailable = !item.available;

  return (
    <Modal open={!!item} onClose={onClose} maxWidth="max-w-lg">
      <div className="relative">
        <img src={item.image} alt={item.name} className="w-full h-56 object-cover sm:rounded-t-3xl" />
        {unavailable && (
          <div className="absolute inset-0 bg-espresso-900/50 flex items-center justify-center">
            <span className="px-4 py-2 rounded-full bg-cream-50 text-espresso-900 font-semibold text-sm">Habis</span>
          </div>
        )}
      </div>
      <div className="p-5 space-y-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-sage-600">{item.category}</span>
          <h2 className="font-display text-2xl text-espresso-900 mt-1">{item.name}</h2>
          <p className="text-espresso-600 text-sm mt-2 leading-relaxed">{item.description}</p>
        </div>
        <div className="text-xl font-display text-espresso-900">{formatIDR(item.price)}</div>

        <div>
          <label className="text-sm font-medium text-espresso-700">Catatan (opsional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Mis. kurang gula, tanpa es, extra shot..."
            className="mt-1.5 w-full rounded-2xl border border-cream-200 bg-white px-4 py-3 text-sm text-espresso-900 placeholder:text-espresso-400 focus:outline-none focus:ring-2 focus:ring-sage-400 resize-none"
            rows={2}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 rounded-full border border-cream-200 bg-white flex items-center justify-center hover:bg-cream-100 transition-colors disabled:opacity-40"
              disabled={quantity <= 1 || unavailable}
              aria-label="Kurangi"
            >
              <Minus size={16} className="text-espresso-700" />
            </button>
            <span className="font-semibold text-espresso-900 w-6 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-10 h-10 rounded-full border border-cream-200 bg-white flex items-center justify-center hover:bg-cream-100 transition-colors disabled:opacity-40"
              disabled={unavailable}
              aria-label="Tambah"
            >
              <Plus size={16} className="text-espresso-700" />
            </button>
          </div>
          <button
            onClick={handleAdd}
            disabled={unavailable}
            className="flex-1 ml-4 flex items-center justify-center gap-2 rounded-2xl bg-espresso-800 text-cream-50 font-semibold py-3.5 hover:bg-espresso-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {added ? (
              <>
                <Check size={18} /> Ditambahkan
              </>
            ) : (
              <>
                <ShoppingBag size={18} /> Tambah · {formatIDR(item.price * quantity)}
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
