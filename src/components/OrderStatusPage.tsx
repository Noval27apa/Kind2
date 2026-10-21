import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Home, Soup, Loader2 } from "lucide-react";
import type { OrderStatus } from "@/lib/types";
import { STATUS_COLORS } from "@/lib/types";
import { useOrderSubscription } from "@/lib/hooks";
import { formatIDR, formatTime } from "@/lib/format";
import { navigate } from "@/lib/router";

interface OrderStatusPageProps {
  orderId: string | null;
  tableNumber: string;
}

const STATUS_FLOW: { status: OrderStatus; label: string; desc: string }[] = [
  { status: "Menunggu", label: "Menunggu Konfirmasi", desc: "Pesanan Anda diterima" },
  { status: "Dikonfirmasi", label: "Dikonfirmasi", desc: "Staf sedang menyiapkan" },
  { status: "Diproses", label: "Sedang Diproses", desc: "Pesanan sedang dibuat" },
  { status: "Siap Diantar", label: "Siap Diantar", desc: "Hampir sampai ke meja Anda" },
];

export function OrderStatusPage({ orderId, tableNumber }: OrderStatusPageProps) {
  const { order, loading } = useOrderSubscription(orderId);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(t);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center px-6 text-center">
        <Loader2 size={36} className="text-sage-600 animate-spin" />
        <p className="mt-4 text-espresso-600">Memuat pesanan...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center px-6 text-center">
        <Soup size={40} className="text-espresso-300 mb-4" />
        <p className="font-display text-xl text-espresso-900">Pesanan tidak ditemukan</p>
        <p className="text-espresso-500 text-sm mt-2 mb-6">Nomor pesanan mungkin tidak valid atau sudah kedaluwarsa.</p>
        <button onClick={() => navigate(`/menu?table=${tableNumber}`)} className="rounded-2xl bg-espresso-800 text-cream-50 px-5 py-3 font-semibold">
          Kembali ke Menu
        </button>
      </div>
    );
  }

  const cancelled = order.status === "Dibatalkan";
  const done = order.status === "Selesai";
  const currentIdx = STATUS_FLOW.findIndex((s) => s.status === order.status);

  return (
    <div className="min-h-screen bg-cream-50 pb-12">
      <header className="sticky top-0 z-20 bg-cream-50/95 backdrop-blur border-b border-cream-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="font-display text-xl text-espresso-900">Status Pesanan</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {/* Order info */}
        <div className="bg-white rounded-3xl shadow-card border border-cream-100 p-5 text-center animate-scale-in">
          {done ? (
            <CheckCircle2 size={48} className="mx-auto text-sage-600 mb-3" />
          ) : cancelled ? (
            <Clock size={48} className="mx-auto text-red-400 mb-3" />
          ) : (
            <Soup size={48} className="mx-auto text-sage-500 mb-3" />
          )}
          <p className="text-xs text-espresso-500 uppercase tracking-wider">Nomor Pesanan</p>
          <p className="font-display text-2xl text-espresso-900 mt-1">{order.orderNumber}</p>
          <div className="mt-3 inline-flex flex-wrap items-center justify-center gap-2">
            <span className="bg-sage-700 text-cream-50 text-xs font-semibold px-2.5 py-1 rounded-full">Meja {order.tableNumber}</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[order.status]}`}>{order.status}</span>
            <span className="text-xs text-espresso-400">{formatTime(order.createdAt)}</span>
          </div>
          <div className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5 inline-block">
            Pembayaran QRIS DEMO — belum terverifikasi sungguhan
          </div>
        </div>

        {/* Progress tracker */}
        {!cancelled && !done && currentIdx >= 0 && (
          <div className="bg-white rounded-2xl shadow-soft border border-cream-100 p-5">
            <div className="space-y-1">
              {STATUS_FLOW.map((s, i) => {
                const reached = i <= currentIdx;
                const active = i === currentIdx;
                return (
                  <div key={s.status} className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          reached ? "bg-sage-600 text-cream-50" : "bg-cream-200 text-espresso-400"
                        } ${active ? "ring-4 ring-sage-300 animate-pulse" : ""}`}
                      >
                        {i + 1}
                      </div>
                      {i < STATUS_FLOW.length - 1 && (
                        <div className={`w-0.5 h-8 ${i < currentIdx ? "bg-sage-500" : "bg-cream-200"}`} />
                      )}
                    </div>
                    <div className="pb-8">
                      <div className={`font-medium text-sm ${reached ? "text-espresso-900" : "text-espresso-400"}`}>{s.label}</div>
                      <div className="text-xs text-espresso-400">{s.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {done && (
          <div className="bg-white rounded-2xl shadow-soft border border-cream-100 p-5 text-center">
            <p className="text-espresso-700">Terima kasih! Pesanan Anda telah selesai. Semoga harinya menyenangkan.</p>
          </div>
        )}

        {cancelled && (
          <div className="bg-white rounded-2xl shadow-soft border border-cream-100 p-5 text-center">
            <p className="text-red-600 font-medium">Pesanan ini telah dibatalkan oleh staf.</p>
            <p className="text-espresso-500 text-sm mt-1">Silakan hubungi staf atau buat pesanan baru.</p>
          </div>
        )}

        {/* Summary */}
        <div className="bg-white rounded-2xl shadow-soft border border-cream-100 p-5">
          <h2 className="font-display text-lg text-espresso-900 mb-3">Ringkasan</h2>
          <div className="space-y-2">
            {order.lines.map((line, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-espresso-700">{line.quantity}× {line.name}</span>
                <span className="text-espresso-900 font-medium">{formatIDR(line.price * line.quantity)}</span>
              </div>
            ))}
          </div>
          {order.note && (
            <p className="text-xs text-espresso-500 italic mt-3 pt-3 border-t border-cream-100">Catatan: "{order.note}"</p>
          )}
          <div className="flex justify-between mt-3 pt-3 border-t border-cream-100">
            <span className="font-medium text-espresso-900">Total</span>
            <span className="font-display text-lg text-espresso-900">{formatIDR(order.total)}</span>
          </div>
        </div>

        <button
          onClick={() => navigate(`/menu?table=${order.tableNumber}`)}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border border-cream-200 bg-white text-espresso-800 font-semibold py-3.5 hover:bg-cream-100 transition-colors"
        >
          <Home size={18} /> Pesan Lagi
        </button>

        <p className="text-center text-xs text-espresso-400">
          Diperbarui {formatTime(now)} · Status diperbarui real-time
        </p>
      </main>
    </div>
  );
}
