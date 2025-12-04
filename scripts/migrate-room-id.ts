import { prisma } from "@/lib/prisma"
import { generateRoomId } from "@/lib/utils"

async function main() {
  console.log("Memulai migrasi idRoom & roomNumber untuk data kamar lama...")

  const rooms = await prisma.room.findMany()

  for (const room of rooms) {
    // Jika sudah punya idRoom dan roomNumber, lewati
    if ((room as any).idRoom && (room as any).roomNumber) continue

    const floor = (room as any).floor ?? 1
    const existingRoomNumber = (room as any).roomNumber as number | null

    const roomNumber = existingRoomNumber && existingRoomNumber > 0 ? existingRoomNumber : 1
    const idRoom = generateRoomId(room.name, floor, roomNumber)

    await prisma.room.update({
      where: { id: room.id },
      data: {
        roomNumber,
        idRoom,
      },
    })

    console.log(`Updated room ${room.id} -> ${idRoom}`)
  }

  console.log("Selesai migrasi idRoom & roomNumber.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


