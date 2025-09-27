/*
  Warnings:

  - A unique constraint covering the columns `[nombre,entidadId]` on the table `Categoria` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nombre,categoriaId]` on the table `SubCategoria` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nombre_entidadId_key" ON "public"."Categoria"("nombre", "entidadId");

-- CreateIndex
CREATE UNIQUE INDEX "SubCategoria_nombre_categoriaId_key" ON "public"."SubCategoria"("nombre", "categoriaId");
