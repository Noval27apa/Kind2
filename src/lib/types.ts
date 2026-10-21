export type CategoryId = "kopi" | "non-kopi" | "teh" | "makanan" | "dessert";

export interface Category {
  id: CategoryId;
  label: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: CategoryId;
  image: string;
  available: boolean;
}

export interface CartLine {
  itemId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  note: string;
}

export type OrderStatus =
  | "Menunggu"
  | "Dikonfirmasi"
  | "Diproses"
  | "Siap Diantar"
  | "Selesai"
  | "Dibatalkan";

export type PaymentMode = "qris-demo";

export interface Order {
  id: string;
  orderNumber: string;
  tableNumber: string;
  lines: CartLine[];
  total: number;
  note: string;
  status: OrderStatus;
  paymentMode: PaymentMode;
  paymentVerified: false;
  createdAt: number;
}

// Row shape as stored in the Supabase `orders` table.
export interface OrderRow {
  id: string;
  order_number: string;
  table_number: string;
  lines: CartLine[];
  total: number;
  note: string;
  status: OrderStatus;
  payment_mode: PaymentMode;
  payment_verified: boolean;
  created_at: string;
}

// Row shape as stored in the Supabase `menu_items` table.
export interface MenuItemRow {
  id: string;
  name: string;
  description: string;
  price: number;
  category: CategoryId;
  image: string;
  available: boolean;
  sort_order: number;
  created_at: string;
}

// Row shape as stored in the Supabase `cafe_tables` table.
export interface CafeTableRow {
  id: string;
  label: string;
  sort_order: number;
  created_at: string;
}

export function rowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    tableNumber: row.table_number,
    lines: Array.isArray(row.lines) ? row.lines : [],
    total: row.total,
    note: row.note ?? "",
    status: row.status,
    paymentMode: row.payment_mode,
    paymentVerified: false,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export function rowToMenuItem(row: MenuItemRow): MenuItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    price: row.price,
    category: row.category,
    image: row.image ?? "",
    available: row.available,
  };
}

export function rowToCafeTable(row: CafeTableRow): CafeTable {
  return {
    id: row.id,
    label: row.label,
  };
}

export interface CafeTable {
  id: string;
  label: string;
}

export const CATEGORIES: Category[] = [
  { id: "kopi", label: "Kopi" },
  { id: "non-kopi", label: "Non-Kopi" },
  { id: "teh", label: "Teh" },
  { id: "makanan", label: "Makanan" },
  { id: "dessert", label: "Dessert" },
];

export const ORDER_STATUSES: OrderStatus[] = [
  "Menunggu",
  "Dikonfirmasi",
  "Diproses",
  "Siap Diantar",
  "Selesai",
  "Dibatalkan",
];

export const STATUS_COLORS: Record<OrderStatus, string> = {
  Menunggu: "bg-amber-100 text-amber-800 border-amber-200",
  Dikonfirmasi: "bg-sky-100 text-sky-800 border-sky-200",
  Diproses: "bg-violet-100 text-violet-800 border-violet-200",
  "Siap Diantar": "bg-emerald-100 text-emerald-800 border-emerald-200",
  Selesai: "bg-stone-200 text-stone-600 border-stone-300",
  Dibatalkan: "bg-red-100 text-red-700 border-red-200",
};
