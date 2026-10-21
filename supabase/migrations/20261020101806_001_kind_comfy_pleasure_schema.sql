/*
# Kind Comfy Pleasure — Skema database cafe ordering

## Tujuan
Membuat penyimpanan bersama untuk aplikasi pemesanan kafe "Kind Comfy Pleasure"
agar pesanan dari pelanggan dapat diterima admin di perangkat berbeda secara
real-time, menu dapat diubah admin, dan kode QR meja tersimpan di database.

## Tabel baru

### `menu_items`
- `id` (uuid PK) — identitas item menu
- `name` (text) — nama item, mis. "Cappuccino Klasik"
- `description` (text) — deskripsi singkat
- `price` (integer) — harga dalam IDR
- `category` (text) — kategori: kopi, non-kopi, teh, makanan, dessert
- `image` (text) — URL gambar
- `available` (boolean) — ketersediaan item
- `sort_order` (integer) — urutan tampil
- `created_at` (timestamptz)

### `cafe_tables`
- `id` (text PK) — identitas meja, mis. "T01"
- `label` (text) — label tampil, mis. "Meja 01"
- `sort_order` (integer) — urutan tampil
- `created_at` (timestamptz)

### `orders`
- `id` (uuid PK) — identitas pesanan
- `order_number` (text, unique) — nomor pesanan unik untuk pelanggan, mis. KCP-...
- `table_number` (text) — nomor meja (tidak FK karena meja bisa dihapus)
- `lines` (jsonb) — baris pesanan [{ itemId, name, price, image, quantity, note }]
- `total` (integer) — total harga
- `note` (text) — catatan keseluruhan pesanan
- `status` (text) — status pesanan: Menunggu, Dikonfirmasi, Diproses, Siap Diantar, Selesai, Dibatalkan
- `payment_mode` (text) — mode pembayaran, mis. "qris-demo"
- `payment_verified` (boolean) — apakah pembayaran terverifikasi (selalu false untuk demo)
- `created_at` (timestamptz)

## Keamanan (RLS)

### `menu_items`
- SELECT: publik (anon + authenticated) — pelanggan perlu melihat menu
- INSERT/UPDATE/DELETE: hanya authenticated (admin) — pelanggan tidak bisa mengubah menu

### `cafe_tables`
- SELECT: publik (anon + authenticated) — pelanggan perlu tahu meja mereka
- INSERT/UPDATE/DELETE: hanya authenticated (admin)

### `orders`
- SELECT: publik (anon + authenticated) — pelanggan perlu melihat status pesanan mereka
  Catatan: untuk demo ini, pesanan bersifat publik agar pelanggan bisa melacak
  status berdasarkan ID tanpa login. Pelanggan tidak bisa MENGUBAH pesanan orang
  lain karena UPDATE/DELETE hanya untuk authenticated (admin).
- INSERT: publik (anon + authenticated) — pelanggan membuat pesanan
- UPDATE/DELETE: hanya authenticated (admin) — pelanggan tidak bisa mengubah
  status atau menghapus pesanan

## Catatan penting
1. Pembayaran QRIS demo selalu disimpan dengan payment_verified = false.
2. Pelanggan (anon) hanya bisa MEMBUAT pesanan baru, bukan mengubahnya.
3. Real-time diaktifkan pada tabel orders dan menu_items agar dashboard admin
   dan halaman status pelanggan memperbarui otomatis.
4. Tidak ada user_id pada orders karena pelanggan tidak login. Pelanggan
   melacak pesanan melalui ID pesanan unik.
*/

-- Tabel menu_items
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price integer NOT NULL DEFAULT 0 CHECK (price >= 0),
  category text NOT NULL DEFAULT 'kopi',
  image text NOT NULL DEFAULT '',
  available boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_menu_items" ON menu_items;
CREATE POLICY "public_select_menu_items"
  ON menu_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_menu_items" ON menu_items;
CREATE POLICY "admin_insert_menu_items"
  ON menu_items FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_menu_items" ON menu_items;
CREATE POLICY "admin_update_menu_items"
  ON menu_items FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_menu_items" ON menu_items;
CREATE POLICY "admin_delete_menu_items"
  ON menu_items FOR DELETE
  TO authenticated USING (true);

-- Tabel cafe_tables
CREATE TABLE IF NOT EXISTS cafe_tables (
  id text PRIMARY KEY,
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE cafe_tables ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_cafe_tables" ON cafe_tables;
CREATE POLICY "public_select_cafe_tables"
  ON cafe_tables FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_cafe_tables" ON cafe_tables;
CREATE POLICY "admin_insert_cafe_tables"
  ON cafe_tables FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_cafe_tables" ON cafe_tables;
CREATE POLICY "admin_update_cafe_tables"
  ON cafe_tables FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_cafe_tables" ON cafe_tables;
CREATE POLICY "admin_delete_cafe_tables"
  ON cafe_tables FOR DELETE
  TO authenticated USING (true);

-- Tabel orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  table_number text NOT NULL,
  lines jsonb NOT NULL DEFAULT '[]'::jsonb,
  total integer NOT NULL DEFAULT 0 CHECK (total >= 0),
  note text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Menunggu',
  payment_mode text NOT NULL DEFAULT 'qris-demo',
  payment_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_orders" ON orders;
CREATE POLICY "public_select_orders"
  ON orders FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_insert_orders" ON orders;
CREATE POLICY "public_insert_orders"
  ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_orders" ON orders;
CREATE POLICY "admin_update_orders"
  ON orders FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_orders" ON orders;
CREATE POLICY "admin_delete_orders"
  ON orders FOR DELETE
  TO authenticated USING (true);

-- Aktifkan real-time untuk orders dan menu_items
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;

-- Index untuk pencarian menu dan urutan pesanan
CREATE INDEX IF NOT EXISTS idx_menu_items_sort ON menu_items(sort_order);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
