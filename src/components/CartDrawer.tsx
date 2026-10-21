import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import type { CartLine } from "@/lib/types";
import { formatIDR } from "@/lib/format";
import { Modal } from "./Modal";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  lines: CartLine[];
  orderNote: string;
  total: number;
  tableNumber: string;
  onSetQuantity: (itemId: string, note: string, quantity: number) => void;
  onSetLineNote: (itemId: string, note: string, newNote: string) => void;
  onSetOrderNote: (note: string) => void;
  onClear: () => void;
  onCheckout: () => void;
}

export function CartDrawer({
  open,
  onClose,
  lines,
  orderNote,
  total,
  tableNumber,
  onSetQuantity,
  onSetLineNote,
  onSetOrderNote,
  onClear,
  onCheckout,
}: CartDrawerProps) {
  return (
    <Modal open={open} onClose={onClose} title="Keranjang Pesanan" maxWidth="max-w-lg">
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm text-espresso-600">
          <span className="bg-sage-700 text-cream-50 text-xs font-semibold px-2.5 py-1 rounded-full">Meja {tableNumber}</span>
        </div>

        {lines.length === 0 ? (
          <div className="text-center py-16 text-espresso-500">
            <ShoppingBag size={36} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Keranjang masih kosong</p>
            <p className="text-sm mt-1 text-espresso-400">Pilih menu favorit Anda untuk mulai memesan.</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 max-h-[40vh] overflow-y-auto -mr-2 pr-2">
              {lines.map((line, idx) => (
                <CartLineRow
                  key={`${line.itemId}-${idx}`}
                  line={line}
                  onSetQuantity={(q) => onSetQuantity(line.itemId, line.note, q)}
                  onSetNote={(newNote) => onSetLineNote(line.itemId, line.note, newNote)}
                />
              ))}
            </div>

            <div>
              <label className="text-sm font-medium text-espresso-700">Catatan untuk pesanan</label>
              <textarea
                value={orderNote}
                onChange={(e) => onSetOrderNote(e.target.value)}
                placeholder="Catatan keseluruhan untuk staf..."
                className="mt-1.5 w-full rounded-2xl border border-cream-200 bg-white px-4 py-2.5 text-sm text-espresso-900 placeholder:text-espresso-400 focus:outline-none focus:ring-2 focus:ring-sage-400 resize-none"
                rows={2}
              />
            </div>

            <button onClick={onClear} className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1.5">
              <Trash2 size={14} /> Kosongkan keranjang
            </button>

            <div className="border-t border-cream-200 pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-espresso-600">Total</span>
                <span className="font-display text-2xl text-espresso-900">{formatIDR(total)}</span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-espresso-800 text-cream-50 font-semibold py-3.5 hover:bg-espresso-900 transition-colors"
              >
                Lanjut ke Pembayaran <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

function CartLineRow({
  line,
  onSetQuantity,
  onSetNote,
}: {
  line: CartLine;
  onSetQuantity: (q: number) => void;
  onSetNote: (note: string) => void;
}) {
  return (
    <div className="flex gap-3 bg-cream-100 rounded-2xl p-3">
      <img src={line.image} alt={line.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-medium text-sm text-espresso-900 truncate">{line.name}</h4>
          <span className="font-semibold text-sm text-espresso-900 shrink-0">{formatIDR(line.price * line.quantity)}</span>
        </div>
        {line.note && <p className="text-xs text-espresso-500 mt-0.5 italic line-clamp-1">"{line.note}"</p>}
        <input
          value={line.note}
          onChange={(e) => onSetNote(e.target.value)}
          placeholder="Edit catatan..."
          className="mt-1.5 w-full text-xs rounded-lg border border-cream-200 bg-white px-2.5 py-1.5 text-espresso-700 placeholder:text-espresso-400 focus:outline-none focus:ring-1 focus:ring-sage-400"
        />
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => onSetQuantity(line.quantity - 1)}
            className="w-7 h-7 rounded-full border border-cream-200 bg-white flex items-center justify-center hover:bg-cream-200 transition-colors"
            aria-label="Kurangi"
          >
            {line.quantity <= 1 ? <Trash2 size={13} className="text-red-500" /> : <Minus size={13} className="text-espresso-700" />}
          </button>
          <span className="font-semibold text-sm text-espresso-900 w-6 text-center">{line.quantity}</span>
          <button
            onClick={() => onSetQuantity(line.quantity + 1)}
            className="w-7 h-7 rounded-full border border-cream-200 bg-white flex items-center justify-center hover:bg-cream-200 transition-colors"
            aria-label="Tambah"
          >
            <Plus size={13} className="text-espresso-700" />
          </button>
          <span className="ml-auto text-xs text-espresso-400">{formatIDR(line.price)} / pcs</span>
        </div>
      </div>
    </div>
  );
}
