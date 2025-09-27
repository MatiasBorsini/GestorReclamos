"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, Building2, FolderOpen, Tag } from "lucide-react"

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
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null)

  const [isEntityDialogOpen, setIsEntityDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")

  // Cargar datos desde la DB
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [entitiesRes, categoriesRes, subcategoriesRes] = await Promise.all([
          fetch("/api/entities"),
          fetch("/api/categories"),
          fetch("/api/subcategories"),
        ])
        const [entitiesData, categoriesData, subcategoriesData] = await Promise.all([
          entitiesRes.json(),
          categoriesRes.json(),
          subcategoriesRes.json(),
        ])

        // Convertir fechas a Date
        setEntities(
          entitiesData.map((e: any) => ({
            ...e,
            createdAt: new Date(e.createdAt),
            updatedAt: new Date(e.updatedAt),
          }))
        )
        setCategories(
          categoriesData.map((c: any) => ({
            ...c,
            createdAt: new Date(c.createdAt),
            updatedAt: new Date(c.updatedAt),
          }))
        )
        setSubcategories(
          subcategoriesData.map((s: any) => ({
            ...s,
            createdAt: new Date(s.createdAt),
            updatedAt: new Date(s.updatedAt),
          }))
        )
      } catch (err) {
        console.error("Error cargando datos:", err)
      }
    }
    fetchData()
  }, [])

  // --- FUNCIONES DE GUARDADO ---
  const handleSaveEntity = (formData: FormData) => {
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const authorName = "Usuario Actual" // TODO: reemplazar con usuario real

    if (editingEntity) {
      setEntities(
        entities.map((e) =>
          e.id === editingEntity.id ? { ...e, name, description, updatedAt: new Date() } : e
        )
      )
    } else {
      const newEntity: Entity = {
        id: name.toLowerCase().replace(/\s+/g, "-"),
        name,
        description,
        categoriesCount: 0,
        authorName,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setEntities([...entities, newEntity])
    }

    setEditingEntity(null)
    setIsEntityDialogOpen(false)
  }

  const handleSaveCategory = (formData: FormData) => {
    const name = formData.get("name") as string
    const entityId = formData.get("entityId") as string
    const entityName = entities.find((e) => e.id === entityId)?.name || ""
    const authorName = "Usuario Actual"

    if (editingCategory) {
      setCategories(
        categories.map((c) =>
          c.id === editingCategory.id
            ? { ...c, name, entityId, entityName, updatedAt: new Date() }
            : c
        )
      )
    } else {
      const newCategory: Category = {
        id: `${entityId}-${name}`.toLowerCase().replace(/\s+/g, "-"),
        name,
        entityId,
        entityName,
        subcategoriesCount: 0,
        authorName,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setCategories([...categories, newCategory])
    }

    setEditingCategory(null)
    setIsCategoryDialogOpen(false)
  }

  const handleSaveSubcategory = (formData: FormData) => {
    const name = formData.get("name") as string
    const categoryId = formData.get("categoryId") as string
    const category = categories.find((c) => c.id === categoryId)
    const authorName = "Usuario Actual"

    if (editingSubcategory) {
      setSubcategories(
        subcategories.map((s) =>
          s.id === editingSubcategory.id
            ? {
                ...s,
                name,
                categoryId,
                categoryName: category?.name || "",
                entityName: category?.entityName || "",
                updatedAt: new Date(),
              }
            : s
        )
      )
    } else {
      const newSubcategory: Subcategory = {
        id: `${categoryId}-${name}`.toLowerCase().replace(/\s+/g, "-"),
        name,
        categoryId,
        categoryName: category?.name || "",
        entityName: category?.entityName || "",
        authorName,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setSubcategories([...subcategories, newSubcategory])
    }

    setEditingSubcategory(null)
    setIsSubcategoryDialogOpen(false)
  }

  // --- FUNCIONES DE ELIMINAR ---
  const handleDeleteEntity = (id: string) => {
    setEntities(entities.filter((e) => e.id !== id))
    const relatedCategories = categories.filter((c) => c.entityId === id)
    relatedCategories.forEach((cat) => {
      setSubcategories(subcategories.filter((s) => s.categoryId !== cat.id))
    })
    setCategories(categories.filter((c) => c.entityId !== id))
  }

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter((c) => c.id !== id))
    setSubcategories(subcategories.filter((s) => s.categoryId !== id))
  }

  const handleDeleteSubcategory = (id: string) => {
    setSubcategories(subcategories.filter((s) => s.id !== id))
  }

  // --- FILTRADO ---
  const filteredEntities = entities.filter(
    (e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.authorName.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.authorName.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const filteredSubcategories = subcategories.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.authorName.toLowerCase().includes(searchTerm.toLowerCase())
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
        <Input
          placeholder="Buscar por nombre, entidad o autor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
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

        {/* --- ENTITIES TAB --- */}
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
                <form action={handleSaveEntity}>
                  <DialogHeader>
                    <DialogTitle>{editingEntity ? "Editar Entidad" : "Nueva Entidad"}</DialogTitle>
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
                    <Button type="button" variant="outline" onClick={() => setIsEntityDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">{editingEntity ? "Guardar Cambios" : "Crear Entidad"}</Button>
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
                          Creado por: {entity.authorName} | {entity.createdAt.toLocaleDateString()}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{entity.categoriesCount} categorías</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingEntity(entity)
                        setIsEntityDialogOpen(true)
                      }}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 bg-transparent"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Eliminar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar entidad?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción eliminará la entidad "{entity.name}" y todas sus categorías y subcategorías
                            asociadas. Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteEntity(entity.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* --- Categories TAB --- */}
        {/* ... Lo mismo para Categories y Subcategories usando filteredCategories y filteredSubcategories */}
      </Tabs>
    </div>
  )
}
