import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    console.log("🔍 Iniciando verificación...")
    const token = req.nextUrl.searchParams.get("token")
    console.log("🔍 Token recibido:", token)
    
    if (!token) {
      console.log("❌ Falta token")
      return NextResponse.json({ error: "Falta token" }, { status: 400 })
    }

    console.log("🔍 Buscando usuario con token...")
    const user = await prisma.user.findFirst({ where: { token_verificacion: token } })
    console.log("🔍 Usuario encontrado:", user ? "Sí" : "No")
    
    if (!user) {
      console.log("❌ Token inválido")
      return NextResponse.json({ error: "Token inválido" }, { status: 404 })
    }

    console.log("🔍 Actualizando usuario...")
    await prisma.user.update({
      where: { id: user.id },
      data: { verificado: true, token_verificacion: null, fecha_verificacion: new Date() },
    })

    console.log("✅ Usuario verificado correctamente")
    return NextResponse.json({ message: "Cuenta verificada correctamente" })
  } catch (error) {
    console.error("❌ Error en verificación:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}


