"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Building2, FolderOpen, Tag } from "lucide-react"

interface Entity {
  id: string
  name: string
  description: string
  categoriesCount: number
  authorName: string
  createdAt: Date
  updatedAt: Date
}

interface Category {
  id: string
  name: string
  entityId: string
  entityName: string
  subcategoriesCount: number
  authorName: string
  createdAt: Date
  updatedAt: Date
}

interface Subcategory {
  id: string
  name: string
  categoryId: string
  categoryName: string
  entityName: string
  authorName: string
  createdAt: Date
  updatedAt: Date
}

export default function EntitiesManagementPage() {
  const [entities, setEntities] = useState<Entity[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])

  const [editingEntity, setEditingEntity] = useState<Entity | null>(null)
  const [isEntityDialogOpen, setIsEntityDialogOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEntity, setSelectedEntity] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const entitiesRes = await fetch("/api/entities")
        const entitiesData = await entitiesRes.json()

        const allCategories: Category[] = []
        const allSubcategories: Subcategory[] = []

        for (const e of entitiesData) {
          const categoriesRes = await fetch(`/api/categories?entity=${encodeURIComponent(e.nombre)}`)
          const categoriesData = await categoriesRes.json()

          const mappedCategories = Array.isArray(categoriesData)
            ? categoriesData.map((c: any) => ({
                id: c.id,
                name: c.nombre,
                entityId: e.id,
                entityName: e.nombre,
                subcategoriesCount: 0,
                authorName: "Sistema",
                createdAt: new Date(),
                updatedAt: new Date(),
              }))
            : []

          allCategories.push(...mappedCategories)

          for (const c of mappedCategories) {
            const subcategoriesRes = await fetch(
              `/api/subcategories?entity=${encodeURIComponent(e.nombre)}&category=${encodeURIComponent(c.name)}`
            )
            const subcategoriesData = await subcategoriesRes.json()

            const mappedSubcategories = Array.isArray(subcategoriesData)
              ? subcategoriesData.map((s: any) => ({
                  id: s.id,
                  name: s.nombre,
                  categoryId: c.id,
                  categoryName: c.name,
                  entityName: e.nombre,
                  authorName: "Sistema",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                }))
              : []

            allSubcategories.push(...mappedSubcategories)
          }
        }

        const mappedEntities = Array.isArray(entitiesData)
          ? entitiesData.map((e: any) => {
              const count = allCategories.filter((c) => c.entityName === e.nombre).length
              return {
                id: e.id,
                name: e.nombre,
                description: e.descripcion || "",
                categoriesCount: count,
                authorName: "Sistema",
                createdAt: new Date(),
                updatedAt: new Date(),
              }
            })
          : []

        setEntities(mappedEntities)
        setCategories(allCategories)
        setSubcategories(allSubcategories)
      } catch (err) {
        console.error("Error cargando datos:", err)
      }
    }

    fetchData()
  }, [])

  const filteredEntities = entities.filter(
    (e) =>
      e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.authorName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredCategories = categories.filter(
    (c) =>
      (!selectedEntity || c.entityName === selectedEntity) &&
      (c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.entityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.authorName?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredSubcategories = subcategories.filter(
    (s) =>
      (!selectedEntity || s.entityName === selectedEntity) &&
      (s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.entityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.authorName?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="p-6 md:ml-64">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Entidades</h1>
          <p className="text-gray-600 mt-1">
            Administra entidades, categorías y subcategorías del sistema de reclamos
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <Input
            placeholder="Buscar por nombre, entidad o autor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">Todas las entidades</option>
            {entities.map((e) => (
              <option key={e.id} value={e.name}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Tabs defaultValue="entities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="entities" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Entidades ({filteredEntities.length})
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Categorías ({filteredCategories.length})
          </TabsTrigger>
          <TabsTrigger value="subcategories" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Subcategorías ({filteredSubcategories.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entities" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Entidades</h2>
            <Dialog open={isEntityDialogOpen} onOpenChange={setIsEntityDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingEntity(null)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Entidad
                </Button>
              </DialogTrigger>
             <DialogContent>
  <form action={() => {}}>
    <DialogHeader>
      <DialogTitle>
        {editingEntity ? "Editar Entidad" : "Nueva Entidad"}
      </DialogTitle>
      <DialogDescription>
        {editingEntity
          ? "Modifica los datos de la entidad"
          : "Crea una nueva entidad para el sistema"}
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4 py-4">
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          name="name"
          defaultValue={editingEntity?.name || ""}
          placeholder="Ej: Hospitales"
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={editingEntity?.description || ""}
          placeholder="Descripción de la entidad"
          required
        />
      </div>
    </div>
    <DialogFooter>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsEntityDialogOpen(false)}
      >
        Cancelar
      </Button>
      <Button type="submit">
        {editingEntity ? "Guardar Cambios" : "Crear Entidad"}
      </Button>
    </DialogFooter>
  </form>
</DialogContent>

            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEntities.map((entity) => (
              <Card key={entity.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{entity.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {entity.description} <br />
                        <span className="text-xs text-gray-500">
                          Creado por: {entity.authorName} |{" "}
                          {entity.createdAt.toLocaleDateString()}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {entity.categoriesCount} categorías
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* --- CATEGORIES TAB --- */}
        <TabsContent value="categories" className="space-y-6">
          <h2 className="text-xl font-semibold">Categorías</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category) => (
              <Card key={category.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <CardDescription className="mt-1">
                        Entidad: {category.entityName} <br />
                        <span className="text-xs text-gray-500">
                          Creado por: {category.authorName} |{" "}
                          {category.createdAt.toLocaleDateString()}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {category.subcategoriesCount} subcategorías
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* --- SUBCATEGORIES TAB --- */}
        <TabsContent value="subcategories" className="space-y-6">
          <h2 className="text-xl font-semibold">Subcategorías</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSubcategories.map((subcategory) => (
              <Card key={subcategory.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{subcategory.name}</CardTitle>
                      <CardDescription className="mt-1">
                        Categoría: {subcategory.categoryName} <br />
                        Entidad: {subcategory.entityName} <br />
                        <span className="text-xs text-gray-500">
                          Creado por: {subcategory.authorName} |{" "}
                          {subcategory.createdAt.toLocaleDateString()}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
