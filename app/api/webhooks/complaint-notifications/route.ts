import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Webhook para notificar a n8n sobre cambios en reclamos
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { complaintId, action, userEmail, complaintTitle, complaintDescription } = body;

    if (!complaintId || !action || !userEmail) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

    // Obtener información del reclamo
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: { author: true, entidad: true }
    });

    if (!complaint) {
      return NextResponse.json({ error: "Reclamo no encontrado" }, { status: 404 });
    }

    // Preparar datos para n8n
    const notificationData = {
      complaintId: complaint.id,
      action, // "created", "closed", o "reopened"
      userEmail: complaint.author.email,
      userName: complaint.author.name,
      complaintTitle: complaint.title,
      complaintDescription: complaint.description,
      complaintCategory: complaint.category,
      complaintSubcategory: complaint.subcategory,
      complaintLocation: complaint.location,
      complaintStatus: complaint.status,
      entityName: complaint.entidad?.nombre || "No especificada",
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
      timestamp: new Date().toISOString()
    };

    // Enviar notificación a n8n
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook';
    const webhookPath = action === 'created' ? 'complaint-created' : 'complaint-closed';
    
    try {
      const n8nResponse = await fetch(`${n8nWebhookUrl}/${webhookPath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData)
      });

      if (n8nResponse.ok) {
        console.log(`📧 Notificación ${action} enviada exitosamente a n8n`);
      } else {
        console.error(`⚠️ Error enviando notificación a n8n: ${n8nResponse.status}`);
      }
    } catch (n8nError) {
      console.error("⚠️ Error de conexión con n8n:", n8nError);
    }

    return NextResponse.json({
      success: true,
      message: `Notificación ${action} procesada`,
      data: notificationData
    });

  } catch (error) {
    console.error("❌ Error en webhook de notificaciones:", error);
    return NextResponse.json({ error: "Error al procesar notificación" }, { status: 500 });
  }
}
