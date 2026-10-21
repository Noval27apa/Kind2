import { useMemo, useState } from "react";
import { Download, Trash2, Plus, AlertCircle, Printer, ExternalLink, Copy, Check } from "lucide-react";
import type { CafeTable } from "@/lib/types";
import { buildMenuUrl, navigate } from "@/lib/router";
import { generateQRSVG, svgToDataURL } from "@/lib/qr";
import { Modal } from "./Modal";

interface StaffTableQRProps {
  tables: CafeTable[];
  onAdd: (label: string) => void;
  onRemove: (id: string) => void;
}

export function StaffTableQR({ tables, onAdd, onRemove }: StaffTableQRProps) {
  const [newLabel, setNewLabel] = useState("");
  const [preview, setPreview] = useState<CafeTable | null>(null);
  const { isLocal } = useMemo(() => buildMenuUrl("T01"), []);

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    onAdd(newLabel.trim());
    setNewLabel("");
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="font-display text-xl text-espresso-900">QR Meja</h2>
        <p className="text-sm text-espresso-500">Cetak atau unduh kode QR untuk setiap meja. Tamu memindai untuk membuka menu.</p>
      </div>

      {/* Local URL warning */}
      <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
        <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-amber-900">{isLocal ? "URL Lokal (Preview)" : "QR siap dipindai"}</p>
          <p className="text-amber-800 mt-1">
            {isLocal
              ? "Untuk demo lewat HP, terbitkan aplikasi terlebih dahulu. Setelah diterbitkan, QR otomatis memakai alamat publik yang bisa dibuka dari perangkat lain."
              : "Pindai QR dari kamera HP untuk membuka menu pelanggan dengan meja ini sudah terpilih. Pesanan akan masuk ke dashboard admin secara realtime."}
          </p>
        </div>
      </div>

      {/* Add table */}
      <div className="flex gap-2 mb-5">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Nama meja baru, mis. Meja 07"
          className="flex-1 rounded-xl border border-cream-200 bg-white px-4 py-2.5 text-sm text-espresso-900 placeholder:text-espresso-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
        />
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 rounded-xl bg-espresso-800 text-cream-50 px-4 py-2.5 text-sm font-semibold hover:bg-espresso-900 transition-colors"
        >
          <Plus size={16} /> Tambah
        </button>
      </div>

      {/* Table grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tables.map((table) => (
          <TableQRCard key={table.id} table={table} onRemove={onRemove} onPreview={setPreview} />
        ))}
      </div>

      <QRPreviewModal table={preview} onClose={() => setPreview(null)} />
    </div>
  );
}

function TableQRCard({ table, onRemove, onPreview }: { table: CafeTable; onRemove: (id: string) => void; onPreview: (t: CafeTable) => void }) {
  const [copied, setCopied] = useState(false);
  const { url, isLocal } = useMemo(() => buildMenuUrl(table.id), [table.id]);
  const qrUrl = useMemo(() => svgToDataURL(generateQRSVG(url, 5, "#1c1410", "#ffffff")), [url]);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `qr-meja-${table.id}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    onPreview(table);
    setTimeout(() => window.print(), 400);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-cream-100 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display text-lg text-espresso-900">{table.label}</h3>
          <p className="text-xs text-espresso-400 font-mono">{table.id}</p>
        </div>
        <button onClick={() => onRemove(table.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" aria-label="Hapus meja">
          <Trash2 size={15} className="text-red-500" />
        </button>
      </div>

      <div className="flex justify-center bg-cream-50 rounded-xl p-3 mb-3">
        <img src={qrUrl} alt={`QR ${table.label}`} className="w-36 h-36" />
      </div>

      {isLocal && (
        <div className="mb-3 text-[10px] text-amber-700 bg-amber-50 rounded-md px-2 py-1 text-center font-semibold">
          URL LOKAL PREVIEW
        </div>
      )}

      <div className="text-[10px] text-espresso-400 break-all bg-cream-50 rounded-md px-2 py-1.5 mb-3 font-mono leading-relaxed">
        {url}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-cream-200 bg-white text-espresso-700 text-xs font-semibold py-2 hover:bg-cream-100 transition-colors"
        >
          <Download size={14} /> Unduh
        </button>
        <button
          onClick={handlePrint}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-cream-200 bg-white text-espresso-700 text-xs font-semibold py-2 hover:bg-cream-100 transition-colors"
        >
          <Printer size={14} /> Cetak
        </button>
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-cream-200 bg-white text-espresso-700 text-xs font-semibold py-2 hover:bg-cream-100 transition-colors"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Tersalin" : "Salin"}
        </button>
        <button
          onClick={() => onPreview(table)}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-cream-200 bg-white text-espresso-700 text-xs font-semibold py-2 hover:bg-cream-100 transition-colors"
        >
          <ExternalLink size={14} /> Lihat
        </button>
      </div>
    </div>
  );
}

function QRPreviewModal({ table, onClose }: { table: CafeTable | null; onClose: () => void }) {
  const { url, isLocal } = useMemo(() => (table ? buildMenuUrl(table.id) : { url: "", isLocal: false }), [table]);
  const qrUrl = useMemo(() => svgToDataURL(generateQRSVG(url, 10, "#1c1410", "#ffffff")), [url]);

  return (
    <Modal open={!!table} onClose={onClose} title={table ? `QR ${table.label}` : ""} maxWidth="max-w-sm">
      {table && (
        <div className="p-5 text-center">
          <div className="flex justify-center mb-4">
            <img src={qrUrl} alt={`QR ${table.label}`} className="w-64 h-64 rounded-2xl" />
          </div>
          <h3 className="font-display text-xl text-espresso-900">{table.label}</h3>
          <p className="text-xs text-espresso-400 font-mono mt-1">{table.id}</p>

          {isLocal && (
            <div className="mt-3 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 font-semibold">
              Menggunakan URL Lokal Preview
            </div>
          )}

          <div className="mt-3 text-[11px] text-espresso-400 break-all bg-cream-50 rounded-lg px-3 py-2 font-mono">
            {url}
          </div>

          <button
            onClick={() => navigator.clipboard.writeText(url)}
            className="mt-3 w-full rounded-xl border border-cream-200 bg-white text-espresso-700 font-semibold py-3 hover:bg-cream-100 transition-colors"
          >
            <Copy size={16} className="inline mr-2" /> Salin tautan menu
          </button>

          <button
            onClick={() => {
              navigate(`/menu?table=${table.id}`);
              onClose();
            }}
            className="mt-4 w-full rounded-xl bg-espresso-800 text-cream-50 font-semibold py-3 hover:bg-espresso-900 transition-colors"
          >
            Buka Menu Meja Ini
          </button>
        </div>
      )}
    </Modal>
  );
}
