import { useCallback, useEffect, useRef, useState } from "react";
import type { CafeTable, MenuItem, Order, OrderStatus } from "./types";
import { rowToCafeTable, rowToMenuItem, rowToOrder, type CafeTableRow, type MenuItemRow, type OrderRow } from "./types";
import { DEFAULT_MENU, DEFAULT_TABLES } from "./menuData";
import { isArrayOfObjects, loadJSON, saveJSON } from "./storage";
import { supabase } from "./supabase";

const MENU_KEY = "kcp.menu";
const TABLES_KEY = "kcp.tables";

function normalizeMenuFallback(raw: unknown): MenuItem[] {
  if (!isArrayOfObjects(raw)) return DEFAULT_MENU;
  return raw
    .map((r) => ({
      id: typeof r.id === "string" ? r.id : "",
      name: typeof r.name === "string" ? r.name : "",
      description: typeof r.description === "string" ? r.description : "",
      price: typeof r.price === "number" && r.price >= 0 ? r.price : 0,
      category: r.category as MenuItem["category"],
      image: typeof r.image === "string" ? r.image : "",
      available: typeof r.available === "boolean" ? r.available : true,
    }))
    .filter((m) => m.id && m.name);
}

function normalizeTablesFallback(raw: unknown): CafeTable[] {
  if (!isArrayOfObjects(raw)) return DEFAULT_TABLES;
  return raw
    .map((r) => ({
      id: typeof r.id === "string" ? r.id : "",
      label: typeof r.label === "string" ? r.label : "",
    }))
    .filter((t) => t.id);
}

export function useMenu() {
  const [menu, setMenu] = useState<MenuItem[]>(() => normalizeMenuFallback(loadJSON(MENU_KEY, DEFAULT_MENU)));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchMenu = async () => {
      const { data, error: err } = await supabase
        .from("menu_items")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!mounted) return;

      if (err) {
        setError("Gagal memuat menu. Menampilkan menu lokal.");
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const items = (data as MenuItemRow[]).map(rowToMenuItem);
        setMenu(items);
        saveJSON(MENU_KEY, items);
      }
      setError(null);
      setLoading(false);
    };

    fetchMenu();

    channelRef.current = supabase
      .channel("menu_items_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_items" }, () => {
        fetchMenu();
      })
      .subscribe();

    return () => {
      mounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  const addMenuItem = useCallback(async (item: MenuItem) => {
    const { error: err } = await supabase.from("menu_items").insert({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      available: item.available,
      sort_order: Date.now(),
    });
    if (err) setError("Gagal menambah item menu.");
  }, []);

  const updateMenuItem = useCallback(async (id: string, patch: Partial<MenuItem>) => {
    const update: Record<string, unknown> = {};
    if (patch.name !== undefined) update.name = patch.name;
    if (patch.description !== undefined) update.description = patch.description;
    if (patch.price !== undefined) update.price = patch.price;
    if (patch.category !== undefined) update.category = patch.category;
    if (patch.image !== undefined) update.image = patch.image;
    if (patch.available !== undefined) update.available = patch.available;
    const { error: err } = await supabase.from("menu_items").update(update).eq("id", id);
    if (err) setError("Gagal memperbarui item menu.");
  }, []);

  const removeMenuItem = useCallback(async (id: string) => {
    const { error: err } = await supabase.from("menu_items").delete().eq("id", id);
    if (err) setError("Gagal menghapus item menu.");
  }, []);

  return { menu, loading, error, addMenuItem, updateMenuItem, removeMenuItem };
}

export function useTables() {
  const [tables, setTables] = useState<CafeTable[]>(() => normalizeTablesFallback(loadJSON(TABLES_KEY, DEFAULT_TABLES)));
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchTables = async () => {
      const { data, error: err } = await supabase
        .from("cafe_tables")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!mounted) return;

      if (err) {
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        const tbls = (data as CafeTableRow[]).map(rowToCafeTable);
        setTables(tbls);
        saveJSON(TABLES_KEY, tbls);
      }
      setLoading(false);
    };

    fetchTables();

    channelRef.current = supabase
      .channel("cafe_tables_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "cafe_tables" }, () => {
        fetchTables();
      })
      .subscribe();

    return () => {
      mounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  const addTable = useCallback(async (label: string) => {
    const id = `T${String(Date.now()).slice(-6)}`;
    const { error: err } = await supabase.from("cafe_tables").insert({
      id,
      label,
      sort_order: Date.now(),
    });
    if (err) {
      // fallback: jika insert gagal (mis. belum login), simpan lokal saja
      setTables((prev) => {
        const updated = [...prev, { id, label }];
        saveJSON(TABLES_KEY, updated);
        return updated;
      });
    }
  }, []);

  const removeTable = useCallback(async (id: string) => {
    const { error: err } = await supabase.from("cafe_tables").delete().eq("id", id);
    if (err) {
      setTables((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        saveJSON(TABLES_KEY, updated);
        return updated;
      });
    }
  }, []);

  return { tables, loading, addTable, removeTable };
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchOrders = async () => {
      const { data, error: err } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (err) {
        setLoading(false);
        return;
      }

      if (data) {
        setOrders((data as OrderRow[]).map(rowToOrder));
      }
      setLoading(false);
    };

    fetchOrders();

    channelRef.current = supabase
      .channel("orders_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        if (payload.eventType === "INSERT") {
          const newRow = payload.new as OrderRow;
          setOrders((prev) => {
            if (prev.some((o) => o.id === newRow.id)) return prev;
            return [rowToOrder(newRow), ...prev];
          });
        } else if (payload.eventType === "UPDATE") {
          const newRow = payload.new as OrderRow;
          setOrders((prev) => prev.map((o) => (o.id === newRow.id ? rowToOrder(newRow) : o)));
        } else if (payload.eventType === "DELETE") {
          const oldRow = payload.old as { id: string };
          setOrders((prev) => prev.filter((o) => o.id !== oldRow.id));
        }
      })
      .subscribe();

    return () => {
      mounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  const addOrder = useCallback(
    async (order: Omit<Order, "id" | "createdAt">): Promise<{ id: string; orderNumber: string } | null> => {
      const { data, error: err } = await supabase
        .from("orders")
        .insert({
          order_number: order.orderNumber,
          table_number: order.tableNumber,
          lines: order.lines,
          total: order.total,
          note: order.note,
          status: order.status,
          payment_mode: order.paymentMode,
          payment_verified: false,
        })
        .select("id, order_number")
        .single();

      if (err) {
        return null;
      }

      return { id: (data as { id: string; order_number: string }).id, orderNumber: (data as { order_number: string }).order_number };
    },
    [],
  );

  const updateOrderStatus = useCallback(async (id: string, status: OrderStatus) => {
    // Optimistic update
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    const { error: err } = await supabase.from("orders").update({ status }).eq("id", id);
    if (err) {
      // Revert handled by next real-time fetch
    }
  }, []);

  const getOrder = useCallback(
    async (id: string): Promise<Order | null> => {
      const { data, error: err } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (err || !data) return null;
      return rowToOrder(data as OrderRow);
    },
    [],
  );

  return { orders, loading, addOrder, updateOrderStatus, getOrder };
}

// Hook untuk melacak satu pesanan secara real-time (halaman status pelanggan).
export function useOrderSubscription(orderId: string | null) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(!!orderId);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchOrder = async () => {
      const { data, error: err } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .maybeSingle();

      if (!mounted) return;

      if (err || !data) {
        setLoading(false);
        return;
      }

      setOrder(rowToOrder(data as OrderRow));
      setLoading(false);
    };

    fetchOrder();

    channelRef.current = supabase
      .channel(`order_${orderId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        (payload) => {
          setOrder(rowToOrder(payload.new as OrderRow));
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [orderId]);

  return { order, loading };
}
