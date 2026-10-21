import { useCallback, useMemo, useState } from "react";
import { useRouter, navigate } from "@/lib/router";
import { useMenu, useOrders, useTables } from "@/lib/hooks";
import { useCart } from "@/lib/useCart";
import { useAuth } from "@/lib/useAuth";
import type { Order } from "@/lib/types";
import { generateOrderNumber } from "@/lib/format";
import { MenuPage } from "@/components/MenuPage";
import { CartDrawer } from "@/components/CartDrawer";
import { CheckoutPage } from "@/components/CheckoutPage";
import { OrderStatusPage } from "@/components/OrderStatusPage";
import { StaffDashboard } from "@/components/StaffDashboard";
import { AdminLoginPage } from "@/components/AdminLoginPage";

const DEFAULT_TABLE = "T01";

export default function App() {
  const route = useRouter();
  const { menu, loading: menuLoading, error: menuError, addMenuItem, updateMenuItem, removeMenuItem } = useMenu();
  const { orders, loading: ordersLoading, addOrder, updateOrderStatus } = useOrders();
  const { tables, addTable, removeTable } = useTables();
  const cart = useCart();
  const auth = useAuth();

  const [cartOpen, setCartOpen] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const tableNumber = useMemo(() => {
    const t = route.query.get("table");
    return t || DEFAULT_TABLE;
  }, [route.query]);

  const path = route.path || "/";

  const handleCompleteOrder = useCallback(
    async (order: Order) => {
      setSubmittingOrder(true);
      setSubmitError(null);
      const result = await addOrder({
        orderNumber: order.orderNumber,
        tableNumber: order.tableNumber,
        lines: order.lines,
        total: order.total,
        note: order.note,
        status: order.status,
        paymentMode: order.paymentMode,
        paymentVerified: false,
      });
      setSubmittingOrder(false);

      if (!result) {
        setSubmitError("Gagal mengirim pesanan ke server. Periksa koneksi dan coba lagi.");
        return;
      }

      cart.clear();
      navigate(`/order?id=${result.id}&table=${order.tableNumber}`);
    },
    [addOrder, cart],
  );

  // Default landing page
  if (path === "/" || path === "") {
    return (
      <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-espresso-800 text-cream-50 mb-5 shadow-soft">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 2v2M14 2v2M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />
              <path d="M6 2v2" />
            </svg>
          </div>
          <h1 className="font-display text-3xl text-espresso-900 mb-2">Kind Comfy Pleasure</h1>
          <p className="text-espresso-500 mb-8">Cafe &amp; Kitchen — pilih untuk memulai</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate(`/menu?table=${DEFAULT_TABLE}`)}
              className="w-full rounded-2xl bg-espresso-800 text-cream-50 font-semibold py-4 hover:bg-espresso-900 transition-colors"
            >
              Buka Menu Pelanggan
            </button>
            <button
              onClick={() => navigate("/staff")}
              className="w-full rounded-2xl border border-cream-200 bg-white text-espresso-800 font-semibold py-4 hover:bg-cream-100 transition-colors"
            >
              Dashboard Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (path === "/menu") {
    return (
      <>
        <MenuPage
          menu={menu}
          tableNumber={tableNumber}
          cartCount={cart.count}
          onAddToCart={cart.addItem}
          onOpenCart={() => setCartOpen(true)}
          onGoCheckout={() => navigate(`/checkout?table=${tableNumber}`)}
        />
        <CartDrawer
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          lines={cart.lines}
          orderNote={cart.note}
          total={cart.total}
          tableNumber={tableNumber}
          onSetQuantity={cart.setQuantity}
          onSetLineNote={cart.setLineNote}
          onSetOrderNote={cart.setOrderNote}
          onClear={cart.clear}
          onCheckout={() => {
            setCartOpen(false);
            navigate(`/checkout?table=${tableNumber}`);
          }}
        />
      </>
    );
  }

  if (path === "/checkout") {
    return (
      <CheckoutPage
        lines={cart.lines}
        orderNote={cart.note}
        total={cart.total}
        tableNumber={tableNumber}
        onBack={() => navigate(`/menu?table=${tableNumber}`)}
        onComplete={handleCompleteOrder}
        onClearCart={cart.clear}
        submitting={submittingOrder}
        submitError={submitError}
        generateOrderNumber={generateOrderNumber}
      />
    );
  }

  if (path === "/order") {
    const orderId = route.query.get("id");
    return <OrderStatusPage orderId={orderId} tableNumber={tableNumber} />;
  }

  if (path === "/staff") {
    if (auth.loading) {
      return (
        <div className="min-h-screen bg-cream-100 flex items-center justify-center">
          <p className="text-espresso-500">Memuat...</p>
        </div>
      );
    }
    if (!auth.isAdmin) {
      return <AdminLoginPage onSignIn={auth.signIn} />;
    }
    return (
      <StaffDashboard
        orders={orders}
        ordersLoading={ordersLoading}
        menu={menu}
        menuLoading={menuLoading}
        menuError={menuError}
        tables={tables}
        onUpdateOrderStatus={updateOrderStatus}
        onAddMenuItem={addMenuItem}
        onUpdateMenuItem={updateMenuItem}
        onRemoveMenuItem={removeMenuItem}
        onAddTable={addTable}
        onRemoveTable={removeTable}
        onSignOut={auth.signOut}
      />
    );
  }

  // 404
  return (
    <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-2xl text-espresso-900 mb-2">Halaman tidak ditemukan</p>
      <button onClick={() => navigate("/")} className="mt-4 rounded-2xl bg-espresso-800 text-cream-50 px-5 py-3 font-semibold">
        Ke Beranda
      </button>
    </div>
  );
}
