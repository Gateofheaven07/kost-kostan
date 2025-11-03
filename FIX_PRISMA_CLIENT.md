# Fix Error: Cannot read properties of undefined (reading 'findUnique')

## Masalah
Error ini terjadi karena Prisma Client belum di-regenerate setelah menambahkan model `Payment` ke schema.

## Solusi

### Langkah 1: Stop Dev Server
Hentikan dev server yang sedang berjalan (Ctrl+C di terminal).

### Langkah 2: Generate Prisma Client
Jalankan perintah berikut:
```bash
npx prisma generate
```

### Langkah 3: Restart Dev Server
Jalankan dev server lagi:
```bash
npm run dev
```

## Alternatif jika Masih Error Permission

Jika masih muncul error permission, coba:

1. **Close semua terminal dan restart** - Pastikan tidak ada process yang memakai Prisma Client
2. **Restart VS Code/Cursor** - Close dan buka lagi editor
3. **Jalankan sebagai Administrator** (Windows):
   - Klik kanan terminal → "Run as administrator"
   - Lalu jalankan `npx prisma generate`

4. **Atau gunakan Prisma Studio** untuk test koneksi:
   ```bash
   npx prisma studio
   ```

## Verifikasi

Setelah generate berhasil, coba:
1. Buka halaman booking
2. Buat booking baru
3. Klik "Lanjutkan ke Pembayaran"
4. Seharusnya tidak ada error lagi dan popup Midtrans muncul

## Catatan

File `app/api/payments/create-token/route.ts` sudah diupdate dengan error handling yang lebih baik. Jika Prisma Client belum di-regenerate, payment masih bisa dibuat tapi record tidak akan tersimpan di database (payment akan tetap berjalan di Midtrans).

