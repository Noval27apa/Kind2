import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  maxWidth?: string;
}

export function Modal({ open, onClose, children, title, maxWidth = "max-w-md" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-espresso-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} bg-cream-50 rounded-t-3xl sm:rounded-3xl shadow-lift max-h-[92vh] overflow-y-auto animate-slide-up`}>
        {title && (
          <div className="sticky top-0 flex items-center justify-between px-5 py-4 bg-cream-50/95 backdrop-blur border-b border-cream-200 z-10">
            <h2 className="font-display text-xl text-espresso-900">{title}</h2>
            <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-cream-200 transition-colors" aria-label="Tutup">
              <X size={20} className="text-espresso-700" />
            </button>
          </div>
        )}
        {!title && (
          <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-cream-50/90 hover:bg-cream-200 transition-colors shadow-soft" aria-label="Tutup">
            <X size={20} className="text-espresso-700" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
