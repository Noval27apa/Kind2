import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check, Loader2 } from "lucide-react";
import type { CategoryId, MenuItem } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";
import { formatIDR } from "@/lib/format";
import { Modal } from "./Modal";

interface StaffMenuManagerProps {
  menu: MenuItem[];
  loading: boolean;
  onAdd: (item: MenuItem) => void;
  onUpdate: (id: string, patch: Partial<MenuItem>) => void;
  onRemove: (id: string) => void;
}

export function StaffMenuManager({ menu, loading, onAdd, onUpdate, onRemove }: StaffMenuManagerProps) {
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const openCreate = () => {
    setEditing({
      id: `m${Date.now()}`,
      name: "",
      description: "",
      price: 0,
      category: "kopi",
      image: "https://images.pexels.com/photos/12039010/pexels-photo-12039010.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      available: true,
    });
    setIsCreating(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditing(item);
    setIsCreating(false);
  };

  const save = () => {
    if (!editing || !editing.name.trim()) return;
    if (isCreating) {
      onAdd(editing);
    } else {
      onUpdate(editing.id, editing);
    }
    setEditing(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-xl text-espresso-900">Kelola Menu</h2>
          <p className="text-sm text-espresso-500">{menu.length} item tersedia</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-espresso-800 text-cream-50 px-4 py-2.5 text-sm font-semibold hover:bg-espresso-900 transition-colors"
        >
          <Plus size={16} /> Tambah Item
        </button>
      </div>

      {loading && (
        <div className="bg-white rounded-2xl shadow-soft border border-cream-100 p-12 text-center">
          <Loader2 size={28} className="mx-auto text-espresso-300 animate-spin" />
          <p className="text-espresso-500 mt-3 text-sm">Memuat menu...</p>
        </div>
      )}

      {!loading && (
      <div className="grid gap-3 sm:grid-cols-2">
        {menu.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl shadow-soft border border-cream-100 p-3 flex gap-3">
            <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-medium text-sm text-espresso-900 truncate">{item.name}</h3>
                  <p className="text-xs text-espresso-500 mt-0.5">{CATEGORIES.find((c) => c.id === item.category)?.label}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${item.available ? "bg-sage-100 text-sage-700" : "bg-red-100 text-red-600"}`}>
                  {item.available ? "Tersedia" : "Habis"}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="font-semibold text-sm text-espresso-900">{formatIDR(item.price)}</span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-cream-100 transition-colors" aria-label="Edit">
                    <Pencil size={15} className="text-espresso-600" />
                  </button>
                  <button onClick={() => onRemove(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" aria-label="Hapus">
                    <Trash2 size={15} className="text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={isCreating ? "Tambah Item Menu" : "Edit Item Menu"} maxWidth="max-w-md">
        {editing && (
          <div className="p-5 space-y-4">
            <Field label="Nama">
              <input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="input"
                placeholder="Nama menu"
              />
            </Field>
            <Field label="Deskripsi">
              <textarea
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="input resize-none"
                rows={2}
                placeholder="Deskripsi singkat"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Harga (IDR)">
                <input
                  type="number"
                  value={editing.price}
                  onChange={(e) => setEditing({ ...editing, price: Math.max(0, Number(e.target.value)) })}
                  className="input"
                  min={0}
                  step={1000}
                />
              </Field>
              <Field label="Kategori">
                <select
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value as CategoryId })}
                  className="input"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="URL Gambar">
              <input
                value={editing.image}
                onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                className="input"
                placeholder="https://..."
              />
            </Field>
            <label className="flex items-center gap-2 cursor-pointer">
              <button
                type="button"
                onClick={() => setEditing({ ...editing, available: !editing.available })}
                className={`relative w-11 h-6 rounded-full transition-colors ${editing.available ? "bg-sage-500" : "bg-cream-300"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${editing.available ? "translate-x-5" : ""}`} />
              </button>
              <span className="text-sm text-espresso-700">{editing.available ? "Tersedia" : "Tidak tersedia"}</span>
            </label>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setEditing(null)} className="flex-1 rounded-xl border border-cream-200 bg-white text-espresso-700 font-semibold py-3 hover:bg-cream-100 transition-colors flex items-center justify-center gap-2">
                <X size={16} /> Batal
              </button>
              <button onClick={save} className="flex-1 rounded-xl bg-espresso-800 text-cream-50 font-semibold py-3 hover:bg-espresso-900 transition-colors flex items-center justify-center gap-2">
                <Check size={16} /> Simpan
              </button>
            </div>
          </div>
        )}
      </Modal>

      <style>{`.input{width:100%;border-radius:0.75rem;border:1px solid #ede1cc;background:#fff;padding:0.625rem 0.875rem;font-size:0.875rem;color:#1c1410;outline:none}.input:focus{box-shadow:0 0 0 2px #8aa090}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-espresso-700 block mb-1.5">{label}</label>
      {children}
    </div>
  );
}
