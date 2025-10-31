# Manajemen Admin - Super Admin Feature

## Overview
Fitur ini memungkinkan **Super Admin** untuk mengelola akun administrator biasa dalam sistem.

## Fitur

### 1. Melihat Daftar Admin
- Menampilkan semua admin dan super admin
- Informasi lengkap: nama, email, nomor telepon, role, tanggal pembuatan
- Statistik: jumlah admin, super admin, dan total

### 2. Membuat Admin Baru
- Form dengan validasi:
  - Nama Lengkap (required)
  - Email (required, unique)
  - Nomor Telepon (optional)
  - Password (required, minimal 8 karakter)
- Auto-assign role "ADMIN"
- Password otomatis di-hash dengan bcrypt

### 3. Menghapus Admin
- Hanya admin biasa yang bisa dihapus
- Super Admin **tidak bisa dihapus**
- Tidak bisa menghapus akun sendiri
- Konfirmasi sebelum menghapus

## Akses

### Menu Sidebar
Menu "Admins" **hanya muncul** untuk Super Admin.

### API Endpoints
Semua endpoint dilindungi dan hanya bisa diakses oleh Super Admin:

- `GET /api/admin/admins` - List semua admin
- `POST /api/admin/admins` - Buat admin baru
- `DELETE /api/admin/admins/[id]` - Hapus admin

## Keamanan

1. **Role-based Access Control**: Hanya SUPER_ADMIN yang bisa akses
2. **Protected Routes**: Semua API mengecek session dan role
3. **Password Security**: Password di-hash dengan bcrypt
4. **Prevent Self-Delete**: Tidak bisa hapus akun sendiri
5. **Prevent Super Admin Delete**: Super Admin tidak bisa dihapus

## Cara Menggunakan

1. Login sebagai Super Admin (`superadmin@kost.test`)
2. Klik menu **"Admins"** di sidebar
3. Untuk membuat admin baru:
   - Klik tombol **"Tambah Admin"**
   - Isi form
   - Klik **"Buat Admin"**
4. Untuk menghapus admin:
   - Klik icon **trash** di samping nama admin
   - Konfirmasi penghapusan

## File Structure

```
app/
  admin/
    admins/
      page.tsx                 # Admin management UI
  api/
    admin/
      admins/
        route.ts              # GET & POST endpoints
        [id]/
          route.ts            # DELETE endpoint
components/
  admin-sidebar.tsx           # Updated with Admins menu
types/
  next-auth.d.ts             # NextAuth type definitions
```

## Notes

- Admin yang dibuat melalui UI ini memiliki role "ADMIN"
- Super Admin hanya bisa dibuat melalui database seed
- Setiap operasi menampilkan toast notification (success/error)

