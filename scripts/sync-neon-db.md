# Cara Sinkronisasi Database Neon

## Masalah: Tabel tidak muncul di Neon Console

Jika tabel tidak muncul di Neon Console, kemungkinan:
1. DATABASE_URL di `.env` berbeda dengan database yang dilihat di Neon Console
2. Schema belum di-push ke database yang benar

## Solusi:

### 1. Pastikan DATABASE_URL Benar

1. Buka Neon Console di browser
2. Pilih project dan branch yang ingin digunakan (misalnya "production")
3. Klik "Connection String" atau "Connection Details"
4. Copy connection string yang muncul (format: `postgresql://...`)

### 2. Update DATABASE_URL di .env

1. Buka file `.env` di root project
2. Pastikan `DATABASE_URL` sesuai dengan connection string dari Neon Console
3. Format: `DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"`

### 3. Push Schema ke Database

Jalankan perintah berikut untuk membuat tabel:

```bash
npx prisma db push --skip-generate
```

### 4. Seed Data (Opsional)

Jika ingin mengisi data awal:

```bash
npx tsx prisma/seed.ts
```

### 5. Verifikasi di Neon Console

1. Refresh halaman Neon Console
2. Klik "Tables" di sidebar
3. Pastikan tabel-tabel sudah muncul

## Checklist:

- [ ] DATABASE_URL di .env sudah sesuai dengan Neon Console
- [ ] Sudah menjalankan `npx prisma db push`
- [ ] Sudah refresh Neon Console
- [ ] Tabel sudah muncul di Neon Console

