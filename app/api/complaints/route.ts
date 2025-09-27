import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const uploadDir = path.join(process.cwd(), "public/uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const title = formData.get("title")?.toString();
    const entityIdRaw = formData.get("entityId")?.toString();
    const category = formData.get("category")?.toString();
    const subcategory = formData.get("subcategory")?.toString();
    const description = formData.get("description")?.toString();
    const location = formData.get("location")?.toString();
    const rawAuthorId = formData.get("authorId")?.toString();
    const photo = formData.get("photo") as File | null;

    const authorId = rawAuthorId?.trim(); // 🔹 Limpieza de saltos de línea
    const numericEntityId = Number(entityIdRaw);

    // 🔒 Validación de campos obligatorios
    if (
      !title ||
      !entityIdRaw ||
      isNaN(numericEntityId) ||
      !category ||
      !subcategory ||
      !description ||
      !authorId
    ) {
      return NextResponse.json({ error: "Faltan datos obligatorios o hay valores inválidos" }, { status: 400 });
    }

    // 📌 Debug: ver qué datos llegan del front
    console.log("📌 Datos recibidos:", {
      title,
      entityIdRaw,
      numericEntityId,
      category,
      subcategory,
      description,
      location,
      authorId,
    });

    // ⚡ Validar que la entidad exista
    const entityExists = await prisma.entidad.findUnique({ where: { id: numericEntityId } });
    console.log("📌 Entidad encontrada:", entityExists);
    if (!entityExists) {
      return NextResponse.json({ error: "La entidad seleccionada no existe" }, { status: 400 });
    }

    // ⚡ Validar que el usuario exista
    const userExists = await prisma.user.findUnique({ where: { id: authorId } });
    console.log("📌 Usuario encontrado:", userExists);
    if (!userExists) {
      return NextResponse.json({ error: "El usuario no existe" }, { status: 400 });
    }

    // ⚡ Guardar imagen si existe
    let photoPath: string | undefined;
    if (photo && photo.size > 0) {
      const buffer = Buffer.from(await photo.arrayBuffer());
      const filename = `${Date.now()}-${photo.name}`;
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, buffer);
      photoPath = `/uploads/${filename}`;
    }

    // ⚡ Crear reclamo
    const complaint = await prisma.complaint.create({
      data: {
        title,
        description,
        location: location || null,
        imageUrl: photoPath,
        authorId,
        category,
        subcategory,
        entityId: numericEntityId,
      },
      include: { author: true, entidad: true, userVotes: true },
    });

    return NextResponse.json(
      {
        id: complaint.id,
        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
        subcategory: complaint.subcategory,
        location: complaint.location ?? "",
        imageUrl: complaint.imageUrl,
        authorId: complaint.authorId,
        authorName: complaint.author.name,
        entity: complaint.entidad?.nombre ?? "",
        status: complaint.status,
        createdAt: complaint.createdAt,
        updatedAt: complaint.updatedAt,
        votes: { positive: 0, negative: 0, userVotes: {} },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("❌ Error al crear el reclamo:", err);
    return NextResponse.json({ error: "Error al crear el reclamo" }, { status: 500 });
  }
}
export async function GET() {
  try {
    const complaints = await prisma.complaint.findMany({
      include: { author: true, entidad: true, userVotes: true },
    });

    const formatted = complaints.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      category: c.category,
      subcategory: c.subcategory,
      location: c.location ?? "",
      imageUrl: c.imageUrl ?? undefined,
      authorId: c.authorId,
      authorName: c.author.name,
      entity: c.entidad?.nombre ?? "",
      status: c.status,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      votes: {
        positive: c.userVotes.filter((v) => v.type === "positive").length,
        negative: c.userVotes.filter((v) => v.type === "negative").length,
        userVotes: Object.fromEntries(c.userVotes.map((v) => [v.userId, v.type])),
      },
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("❌ Error al obtener reclamos:", error);
    return NextResponse.json({ error: "Error al obtener reclamos" }, { status: 500 });
  }
}
