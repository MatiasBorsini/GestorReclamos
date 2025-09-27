import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: obtener todas las FAQs
export async function GET() {
  try {
    const faqs = await prisma.fAQ.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(faqs);
  } catch (error) {
    console.error("Error al obtener FAQs:", error);
    return NextResponse.json({ error: "No se pudieron cargar las FAQs" }, { status: 500 });
  }
}

// POST: crear una nueva FAQ
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, answer, category, isActive } = body;

    if (!question || !answer || !category) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 });
    }

    const faq = await prisma.fAQ.create({
      data: {
        question,
        answer,
        category,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(faq);
  } catch (error) {
    console.error("Error al crear FAQ:", error);
    return NextResponse.json({ error: "No se pudo crear la FAQ" }, { status: 500 });
  }
}
