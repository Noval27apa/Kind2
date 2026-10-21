import { useState } from "react";
import { ArrowLeft, ShieldAlert, Check, Loader2, QrCode, AlertCircle } from "lucide-react";
import type { CartLine, Order } from "@/lib/types";
import { formatIDR } from "@/lib/format";
import { generateQRSVG, svgToDataURL } from "@/lib/qr";

interface CheckoutPageProps {
  lines: CartLine[];
  orderNote: string;
  total: number;
  tableNumber: string;
  onBack: () => void;
  onComplete: (order: Order) => void;
  onClearCart: () => void;
  submitting: boolean;
  submitError: string | null;
  generateOrderNumber: () => string;
}

type Step = "summary" | "pay";

export function CheckoutPage({
  lines,
  orderNote,
  total,
  tableNumber,
  onBack,
  onComplete,
  submitting,
  submitError,
  generateOrderNumber,
}: CheckoutPageProps) {
  const [step, setStep] = useState<Step>("summary");

  const handleConfirm = () => setStep("pay");

  const handlePayDemo = () => {
    const order: Order = {
      id: `tmp-${Date.now()}`,
      orderNumber: generateOrderNumber(),
      tableNumber,
      lines,
      total,
      note: orderNote,
      status: "Menunggu",
      paymentMode: "qris-demo",
      paymentVerified: false,
      createdAt: Date.now(),
    };
    onComplete(order);
  };

  const demoQR = generateQRSVG("QRIS-DEMO-PAYMENT-KINDCOMFYPREASURE-NOTREAL", 8, "#1c1410", "#ffffff");
  const demoQRUrl = svgToDataURL(demoQR);

  if (lines.length === 0 && step === "summary" && !submitting) {
    return (
      <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-espresso-600 mb-4">Keranjang Anda kosong.</p>
        <button onClick={onBack} className="rounded-2xl bg-espresso-800 text-cream-50 px-5 py-3 font-semibold">
          Kembali ke Menu
        </button>
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center px-6 text-center">
        <Loader2 size={40} className="text-sage-600 animate-spin" />
        <p className="mt-4 text-espresso-700 font-medium">Mengirim pesanan ke server...</p>
        <p className="text-sm text-espresso-400 mt-1">Mohon tunggu sebentar</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="sticky top-0 z-20 bg-cream-50/95 backdrop-blur border-b border-cream-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => (step === "summary" ? onBack() : setStep("summary"))}
            className="p-2 -ml-2 rounded-full hover:bg-cream-200 transition-colors"
            aria-label="Kembali"
          >
            <ArrowLeft size={20} className="text-espresso-700" />
          </button>
          <h1 className="font-display text-xl text-espresso-900">
            {step === "summary" ? "Ringkasan Pesanan" : "Pembayaran QRIS"}
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5">
        {step === "summary" && (
          <div className="space-y-5 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-soft border border-cream-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-espresso-600">Meja</span>
                <span className="bg-sage-700 text-cream-50 text-sm font-semibold px-3 py-1 rounded-full">{tableNumber}</span>
              </div>
              <div className="space-y-3">
                {lines.map((line, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <img src={line.image} alt={line.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <span className="text-sm font-medium text-espresso-900 truncate">{line.name}</span>
                        <span className="text-sm font-semibold text-espresso-900 shrink-0">{formatIDR(line.price * line.quantity)}</span>
                      </div>
                      <div className="text-xs text-espresso-500">{line.quantity} × {formatIDR(line.price)}</div>
                      {line.note && <div className="text-xs text-espresso-400 italic mt-0.5">"{line.note}"</div>}
                    </div>
                  </div>
                ))}
              </div>
              {orderNote && (
                <div className="mt-4 pt-4 border-t border-cream-100">
                  <span className="text-xs text-espresso-500">Catatan pesanan:</span>
                  <p className="text-sm text-espresso-700 mt-1 italic">"{orderNote}"</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-soft border border-cream-100 p-5">
              <div className="flex items-center justify-between">
                <span className="text-espresso-600">Total Pembayaran</span>
                <span className="font-display text-2xl text-espresso-900">{formatIDR(total)}</span>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-espresso-800 text-cream-50 font-semibold py-4 hover:bg-espresso-900 transition-colors"
            >
              <QrCode size={18} /> Bayar dengan QRIS (Demo)
            </button>
          </div>
        )}

        {step === "pay" && (
          <div className="space-y-5 animate-fade-in">
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 flex items-start gap-3">
              <ShieldAlert size={22} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 text-sm">MODE DEMO — Bukan Pembayaran Sungguhan</p>
                <p className="text-xs text-amber-800 mt-1">
                  Kode QR ini hanya untuk simulasi. Tidak ada uang nyata yang diproses. Jangan memindai dengan aplikasi pembayaran sungguhan.
                </p>
              </div>
            </div>

            {submitError && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="bg-white rounded-3xl shadow-card border border-cream-100 p-6 flex flex-col items-center">
              <div className="text-xs font-bold tracking-widest text-amber-700 bg-amber-100 px-3 py-1 rounded-full mb-4">
                DEMO
              </div>
              <div className="relative">
                <img src={demoQRUrl} alt="QRIS Demo QR" className="w-56 h-56 rounded-2xl" />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-cream-50/90 rounded-xl px-3 py-1.5 text-center">
                    <div className="font-display text-xs text-espresso-900">Kind Comfy</div>
                    <div className="text-[9px] text-amber-700 font-bold">DEMO ONLY</div>
                  </div>
                </div>
              </div>
              <div className="mt-5 text-center">
                <p className="text-sm text-espresso-600">Total Pembayaran</p>
                <p className="font-display text-2xl text-espresso-900 mt-1">{formatIDR(total)}</p>
              </div>
              <p className="mt-3 text-xs text-espresso-400 text-center max-w-xs">
                Klik tombol di bawah untuk mensimulasikan pembayaran. Pesanan akan dikirim ke dapur sebagai simulasi — pembayaran belum terverifikasi.
              </p>
            </div>

            <button
              onClick={handlePayDemo}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-sage-600 text-cream-50 font-semibold py-4 hover:bg-sage-700 transition-colors"
            >
              <Check size={18} /> Kirim Pesanan (Simulasi QRIS)
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
