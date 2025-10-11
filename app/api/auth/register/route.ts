import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import crypto from "crypto"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "El usuario ya existe" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const token = crypto.randomBytes(32).toString("hex")

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        token_verificacion: token,
      },
    })

    // Llamar webhook de n8n para enviar correo de verificación
    const webhookUrl = process.env.N8N_VERIFICATION_WEBHOOK_URL
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, token }),
        })
      } catch (err) {
        console.error("Error llamando al webhook de verificación:", err)
        // No fallamos el registro si falla el webhook
      }
    } else {
      console.warn("N8N_VERIFICATION_WEBHOOK_URL no está configurado")
      // Para demo local: mostrar link en consola
      console.log(`Link de verificación (demo local): http://localhost:3000/api/verificar?token=${token}`)
    }

    return NextResponse.json({ message: "Usuario registrado correctamente. Revisa tu correo para verificar la cuenta." })
  } catch (error) {
    console.error("Error en registro:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
