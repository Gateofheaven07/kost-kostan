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
   - **Langsung membuka popup payment Midtrans** (tanpa konfirmasi admin)
3. User menyelesaikan pembayaran di popup Midtrans
4. Midtrans mengirim notification ke webhook `/api/payments/notification`
5. Webhook akan:
   - Validasi signature dan data dari Midtrans
   - Update payment status di database
   - **Auto-update booking status** berdasarkan status pembayaran:
     - `settlement` atau `capture` → Booking status menjadi `CONFIRMED` (otomatis, tanpa konfirmasi admin)
     - `pending` → Booking tetap `PENDING` (menunggu pembayaran)
     - `cancel`, `expire`, atau `deny` → Booking status menjadi `CANCELLED`

## Webhook Configuration

### Setup Webhook di Midtrans Dashboard

1. **Login ke Midtrans Dashboard:**
   - Sandbox: https://dashboard.sandbox.midtrans.com/
   - Production: https://dashboard.midtrans.com/

2. **Masuk ke Settings > Configuration:**
   - Pilih tab "Notification URL"

3. **Set Notification URL:**
   ```
   Sandbox: https://your-domain.com/api/payments/notification
   Production: https://your-domain.com/api/payments/notification
   ```

4. **Save Configuration**

### Webhook Endpoint Details

**Endpoint:** `POST /api/payments/notification`

**Request dari Midtrans:**
- Content-Type: `application/json`
- Method: `POST`
- Body: JSON dengan data transaksi Midtrans

**Response yang Dikembalikan:**
- Status 200: `{ "status": "OK", "message": "Notification processed successfully" }`
- Status 400: `{ "error": "Missing required fields" }`
- Status 404: `{ "error": "Payment not found" }`
- Status 500: `{ "error": "Gagal memproses notifikasi" }`

**Validasi yang Dilakukan:**
1. ✅ Validasi required fields (order_id, transaction_status, status_code, gross_amount)
2. ✅ Validasi signature (untuk production - saat ini di-skip untuk sandbox)
3. ✅ Mencari payment berdasarkan order_id
4. ✅ Update payment status di database
5. ✅ Auto-update booking status berdasarkan payment status

**Status Payment yang Dihandle:**
- `pending` - Pembayaran sedang menunggu
- `settlement` - Pembayaran berhasil
- `capture` - Pembayaran berhasil (credit card)
- `cancel` - Pembayaran dibatalkan
- `expire` - Pembayaran expired
- `deny` - Pembayaran ditolak

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

