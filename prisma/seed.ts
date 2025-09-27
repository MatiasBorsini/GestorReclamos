// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { complaintData } from "../lib/complaint-data"; // sin extensión .js

const prisma = new PrismaClient();

async function main() {
  for (const entityName of Object.keys(complaintData)) {
    // Crear Entidad
    const entidad = await prisma.entidad.upsert({
      where: { nombre: entityName },
      update: {},
      create: { nombre: entityName },
    });

    // Crear Categorías y Subcategorías
    const categories = complaintData[entityName];
    for (const categoryName of Object.keys(categories)) {
      const categoria = await prisma.categoria.upsert({
        where: { nombre_entidadId: { nombre: categoryName, entidadId: entidad.id } },
        update: {},
        create: { nombre: categoryName, entidadId: entidad.id },
      });

      const subcategories = categories[categoryName];
      for (const subName of subcategories) {
        await prisma.subCategoria.upsert({
          where: { nombre_categoriaId: { nombre: subName, categoriaId: categoria.id } },
          update: {},
          create: { nombre: subName, categoriaId: categoria.id },
        });
      }
    }
  }

  console.log("Base de datos poblada ✅");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
