# Integrasi Midtrans Payment Gateway

## Konfigurasi

Pastikan environment variables berikut sudah di-set di file `.env`:

```env
MIDTRANS_SERVER_KEY=Mid-server-pCE7eZLvpWJ9JZmpDQy6RbnH
MIDTRANS_CLIENT_KEY=Mid-client-6ynAvOYFntPXk6wC
```

## Database

Tabel `Payment` sudah dibuat di database dengan struktur:
- Menyimpan data transaksi Midtrans
- Terhubung dengan tabel `Booking`
- Menyimpan status pembayaran dan informasi transaksi

## API Endpoints

### 1. Create Payment Token
**POST** `/api/payments/create-token`

Body:
```json
{
  "bookingId": "booking-id-here"
}
```

Response:
```json
{
  "token": "snap-token-here",
  "orderId": "ORDER-xxx",
  "paymentId": "payment-id"
}
```

### 2. Payment Notification (Webhook)
**POST** `/api/payments/notification`

Endpoint ini akan menerima notification dari Midtrans dan otomatis update status booking.

**Catatan:** Set URL notification ini di dashboard Midtrans:
- Sandbox: `https://your-domain.com/api/payments/notification`
- Production: `https://your-domain.com/api/payments/notification`

## Flow Pembayaran

1. User membuat booking di halaman `/booking`
2. Setelah booking dibuat, system akan:
   - Membuat payment record di database
   - Generate Snap token dari Midtrans
   - Membuka popup payment Midtrans
3. User menyelesaikan pembayaran di popup Midtrans
4. Midtrans mengirim notification ke webhook
5. System update status booking berdasarkan status pembayaran:
   - `settlement` atau `capture` → Booking status menjadi `CONFIRMED`
   - `cancel`, `expire`, atau `deny` → Booking status menjadi `CANCELLED`

## Testing di Sandbox

Gunakan test card berikut untuk testing:
- **Card Number:** 4811111111111114
- **CVV:** 123
- **Expiry:** Bulan/tahun masa depan (misal: 12/25)
- **OTP:** 123456

Atau gunakan Virtual Account untuk testing:
- Bank: BCA, BNI, Mandiri, dll (pilih sesuai kebutuhan)

## Production

Untuk production, ubah konfigurasi di:
1. `app/api/payments/create-token/route.ts` - Set `isProduction: true`
2. `app/booking/page.tsx` - Ganti script Snap.js ke production:
   ```jsx
   <Script
     src="https://app.midtrans.com/snap/snap.js"
     data-client-key="YOUR_PRODUCTION_CLIENT_KEY"
   />
   ```
3. Update `MIDTRANS_SERVER_KEY` dan `MIDTRANS_CLIENT_KEY` dengan production keys

