# Kost Management System

Platform manajemen kost terpadu dengan fitur booking, admin dashboard, dan pengelolaan kamar.

## Fitur Utama

- 🏠 **Listing Kamar**: Tampilkan kamar dengan filter harga, periode sewa, dan fasilitas
- 📅 **Sistem Booking**: Penyewa dapat memesan kamar dengan berbagai periode sewa
- 👨‍💼 **Admin Dashboard**: Kelola kamar, booking, penyewa, dan pengaturan kost
- 🔐 **Autentikasi**: Login/registrasi dengan email dan password
- 📱 **Responsive Design**: Desain mobile-first yang responsif
- 🎨 **Modern UI**: Menggunakan shadcn/ui dan Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: Prisma ORM + SQLite (dev) / PostgreSQL (prod)
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Form Validation**: Zod + react-hook-form

## Setup & Installation

### 1. Clone Repository

\`\`\`bash
git clone <repository-url>
cd kost-management
\`\`\`

### 2. Install Dependencies

\`\`\`bash
pnpm install
\`\`\`

### 3. Setup Environment Variables

Buat file `.env.local` di root project:

\`\`\`env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
\`\`\`

### 4. Setup Database

\`\`\`bash
# Push schema ke database
pnpm db:push

# Seed data (admin user, sample rooms, etc)
pnpm db:seed
\`\`\`

### 5. Run Development Server

\`\`\`bash
pnpm dev
\`\`\`

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Default Credentials

### Admin Account
- **Email**: admin@kost.test
- **Password**: Admin123!

### User Account (untuk testing)
- **Email**: budi@example.com
- **Password**: User123!
- **Email**: siti@example.com
- **Password**: User123!

## Struktur Folder

\`\`\`
├── app/
│   ├── api/                 # API routes
│   ├── admin/              # Admin pages
│   ├── auth/               # Auth pages
│   ├── booking/            # Booking pages
│   ├── bookings/           # User bookings
│   ├── rooms/              # Room listing & detail
│   ├── about/              # About page
│   ├── contact/            # Contact page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── navbar.tsx          # Navigation bar
│   ├── footer.tsx          # Footer
│   └── admin-sidebar.tsx   # Admin sidebar
├── lib/
│   ├── prisma.ts           # Prisma client singleton
│   ├── auth.ts             # NextAuth config
│   ├── auth-utils.ts       # Auth utilities
│   └── utils.ts            # Utility functions
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.js             # Seed script
└── public/                 # Static assets
\`\`\`

## Database Schema

### Models

- **User**: Pengguna (admin/user)
- **Kost**: Informasi kost
- **Owner**: Profil pemilik kost
- **Room**: Data kamar
- **RoomImage**: Galeri kamar
- **Price**: Harga sewa per periode
- **Booking**: Pemesanan kamar
- **TenantProfile**: Profil penyewa (opsional)

## API Endpoints

### Public
- `GET /api/rooms` - Daftar kamar dengan filter
- `GET /api/rooms/[id]` - Detail kamar
- `POST /api/auth/register` - Registrasi user
- `POST /api/contact` - Kirim pesan kontak

### Protected (User)
- `POST /api/bookings` - Buat booking
- `GET /api/bookings` - Daftar booking user

### Protected (Admin)
- `GET /api/admin/rooms` - Daftar kamar
- `POST /api/admin/rooms` - Tambah kamar
- `PUT /api/admin/rooms/[id]` - Edit kamar
- `DELETE /api/admin/rooms/[id]` - Hapus kamar
- `GET /api/admin/bookings` - Daftar booking
- `PATCH /api/admin/bookings/[id]` - Update status booking
- `GET /api/admin/tenants` - Daftar penyewa
- `GET/PUT /api/admin/settings/kost` - Pengaturan kost
- `GET/PUT /api/admin/settings/owner` - Pengaturan pemilik

## Fitur Booking

1. **Pilih Kamar**: User memilih kamar dari listing
2. **Pilih Periode**: Pilih periode sewa (mingguan/bulanan/3/6/12 bulan)
3. **Pilih Tanggal**: Tentukan tanggal mulai sewa
4. **Konfirmasi**: Review ringkasan dan buat booking
5. **Status**: Admin mengkonfirmasi atau menolak booking

## Admin Dashboard

### Dashboard
- Statistik: Total kamar, booking pending/confirmed, total penyewa

### Kelola Kamar
- Tambah kamar baru
- Edit informasi kamar
- Kelola harga per periode
- Hapus kamar

### Kelola Booking
- Lihat semua booking
- Ubah status booking (pending → confirmed/cancelled)
- Lihat detail penyewa

### Kelola Penyewa
- Daftar semua penyewa
- Lihat informasi kontak

### Pengaturan
- Edit informasi kost (nama, alamat, deskripsi, fasilitas, kontak)
- Edit profil pemilik (nama, foto, bio, media sosial)

## Deployment

### Deploy ke Vercel

1. Push code ke GitHub
2. Buka [vercel.com](https://vercel.com)
3. Import project dari GitHub
4. Setup environment variables di Vercel
5. Deploy

### Production Database

Untuk production, gunakan PostgreSQL:

\`\`\`env
DATABASE_URL="postgresql://user:password@host:5432/kost_db"
\`\`\`

## Development Tips

### Prisma Studio

Lihat dan edit data langsung:

\`\`\`bash
pnpm db:studio
\`\`\`

### Reset Database

\`\`\`bash
pnpm prisma migrate reset
\`\`\`

### Generate Prisma Client

\`\`\`bash
pnpm prisma generate
\`\`\`

## Troubleshooting

### Database Error
- Pastikan `DATABASE_URL` sudah benar di `.env.local`
- Jalankan `pnpm db:push` untuk sync schema

### Auth Error
- Pastikan `NEXTAUTH_SECRET` sudah diset
- Clear cookies browser dan login ulang

### Build Error
- Hapus folder `.next` dan `node_modules`
- Jalankan `pnpm install` dan `pnpm build` ulang

## Kontribusi

Untuk kontribusi, silakan buat pull request dengan deskripsi perubahan yang jelas.

## License

MIT License - Bebas digunakan untuk keperluan komersial maupun non-komersial.

## Support

Untuk pertanyaan atau masalah, silakan buat issue di repository ini.
