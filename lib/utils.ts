import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate room ID with format INISIAL-LANTAI-NOMOR
 * Example:
 *   name: "Kamar Premium", floor: 1, roomNumber: 101
 *   => "KP-01-101"
 */
export function generateRoomId(name: string, floor: number, roomNumber: number | string) {
  // Inisial nama: ambil huruf pertama dari setiap kata yang bukan kosong
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')

  // Lantai: dua digit
  const floorPart = String(floor).padStart(2, '0')

  // Nomor kamar: tiga digit (tetap hormati jika sudah lebih dari 3 digit)
  const roomNumberNumeric = typeof roomNumber === 'string' ? Number(roomNumber) || roomNumber : roomNumber
  const roomPart =
    typeof roomNumberNumeric === 'number'
      ? String(roomNumberNumeric).padStart(3, '0')
      : String(roomNumberNumeric)

  return `${initials}-${floorPart}-${roomPart}`
}
