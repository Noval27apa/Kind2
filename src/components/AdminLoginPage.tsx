import { useState } from "react";
import { Lock, Loader2, ArrowLeft, ShieldAlert } from "lucide-react";
import { navigate } from "@/lib/router";
import { Logo } from "./Logo";

interface AdminLoginPageProps {
  onSignIn: (email: string, password: string) => Promise<{ error: string | null }>;
}

export function AdminLoginPage({ onSignIn }: AdminLoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setSubmitting(true);
    setError(null);
    const result = await onSignIn(email.trim(), password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-sm text-espresso-500 hover:text-espresso-700 mb-6 transition-colors"
          >
            <ArrowLeft size={16} /> Kembali ke beranda
          </button>

          <div className="bg-white rounded-3xl shadow-card border border-cream-100 p-7">
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-espresso-800 text-cream-50 flex items-center justify-center mb-3 shadow-soft">
                <Lock size={26} />
              </div>
              <Logo showText={false} size={0} />
              <h1 className="font-display text-2xl text-espresso-900 mt-2">Login Admin</h1>
              <p className="text-sm text-espresso-500 mt-1">Kind Comfy Pleasure — Dashboard Staf</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-espresso-700 block mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kindcomfy.cafe"
                  className="w-full rounded-xl border border-cream-200 bg-cream-50 px-4 py-3 text-sm text-espresso-900 placeholder:text-espresso-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
                  autoComplete="email"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-espresso-700 block mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-cream-200 bg-cream-50 px-4 py-3 text-sm text-espresso-900 placeholder:text-espresso-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
                  autoComplete="current-password"
                  required
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                  <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-espresso-800 text-cream-50 font-semibold py-3.5 hover:bg-espresso-900 transition-colors disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Masuk...
                  </>
                ) : (
                  <>
                    <Lock size={16} /> Masuk
                  </>
                )}
              </button>
            </form>

            <p className="mt-5 text-xs text-espresso-400 text-center leading-relaxed">
              Hanya admin yang terdaftar dapat mengakses dashboard. Pelanggan tidak perlu login untuk memesan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
