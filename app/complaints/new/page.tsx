"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

type Entity = { id: number; nombre: string }
type Category = { id: number; nombre: string }
type Subcategory = { id: number; nombre: string }

export default function NewComplaintPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [title, setTitle] = useState("")
  const [entityId, setEntityId] = useState("") // ⚡ guardamos el id como string
  const [category, setCategory] = useState("")
  const [subcategory, setSubcategory] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [entities, setEntities] = useState<Entity[]>([])
  const [availableCategories, setAvailableCategories] = useState<Category[]>([])
  const [availableSubcategories, setAvailableSubcategories] = useState<Subcategory[]>([])

  // ⚡ Nombre de la entidad seleccionada según entityId
  const selectedEntityName = entities.find((e) => e.id.toString() === entityId)?.nombre

  // ⚡ Cargar entidades
  useEffect(() => {
    if (!user) return
    fetch("/api/entities")
      .then((res) => res.json())
      .then((data) => setEntities(data))
      .catch(() => setError("Error al cargar entidades"))
  }, [user])

  // ⚡ Cargar categorías según entidad seleccionada
  useEffect(() => {
    if (!entityId || !selectedEntityName) {
      setAvailableCategories([])
      setCategory("")
      setSubcategory("")
      setAvailableSubcategories([])
      return
    }

    fetch(`/api/categories?entity=${encodeURIComponent(selectedEntityName)}`)
      .then((res) => res.json())
      .then((data) => {
        setAvailableCategories(data)
        setCategory("")
        setSubcategory("")
        setAvailableSubcategories([])
      })
      .catch(() => setError("Error al cargar categorías"))
  }, [entityId, selectedEntityName])

  // ⚡ Cargar subcategorías según categoría
  useEffect(() => {
    if (!entityId || !category || !selectedEntityName) {
      setAvailableSubcategories([])
      setSubcategory("")
      return
    }

    fetch(
      `/api/subcategories?entity=${encodeURIComponent(selectedEntityName)}&category=${encodeURIComponent(category)}`
    )
      .then((res) => res.json())
      .then((data) => {
        setAvailableSubcategories(data)
        setSubcategory("")
      })
      .catch(() => setError("Error al cargar subcategorías"))
  }, [entityId, category, selectedEntityName])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return setError("La imagen no puede superar los 5MB")
    if (!file.type.startsWith("image/")) return setError("Solo se permiten archivos de imagen")

    setPhoto(file)
    const reader = new FileReader()
    reader.onload = (e) => setPhotoPreview(e.target?.result as string)
    reader.readAsDataURL(file)
    setError("")
  }

  const removePhoto = () => {
    setPhoto(null)
    setPhotoPreview(null)
  }

  const clearForm = () => {
    setTitle("")
    setEntityId("")
    setCategory("")
    setSubcategory("")
    setDescription("")
    setLocation("")
    setPhoto(null)
    setPhotoPreview(null)
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!user) {
      setError("Debes iniciar sesión")
      setLoading(false)
      return
    }

    if (!title.trim()) {
      setError("El título es obligatorio")
      setLoading(false)
      return
    }

    if (!entityId || !category || !subcategory) {
      setError("Debes seleccionar entidad, categoría y subcategoría")
      setLoading(false)
      return
    }

    if (!description.trim() || description.length < 20) {
      setError("La descripción debe tener al menos 20 caracteres")
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("entityId", entityId)  // ⚡ ID correcto
      formData.append("category", category)
      formData.append("subcategory", subcategory)
      formData.append("description", description)
      formData.append("location", location || "")
      formData.append("authorId", user.id)
      if (photo) formData.append("photo", photo)

      const res = await fetch("/api/complaints", { method: "POST", body: formData })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.error || "Error al crear reclamo")
      }

      toast({
        title: "¡Reclamo creado exitosamente! 🎉",
        description: "Tu reclamo ha sido registrado y será revisado por los administradores.",
      })

      clearForm()
      router.push("/complaints/my")
    } catch (err: any) {
      console.error("Error al crear reclamo:", err)
      setError(err.message || "Error al crear el reclamo. Inténtalo nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  if (!user) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div></div>

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>

        {error && <Alert variant="destructive" className="mb-4"><AlertDescription>{error}</AlertDescription></Alert>}

        <Card>
          <CardHeader><CardTitle>Nuevo Reclamo</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Título</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título del reclamo" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* ENTIDAD */}
                <div>
                  <Label>Entidad</Label>
                  <Select value={entityId} onValueChange={setEntityId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona entidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {entities.map((e) => (
                        <SelectItem key={e.id} value={e.id.toString()}>{e.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* CATEGORÍA */}
                <div>
                  <Label>Categoría</Label>
                  <Select value={category} onValueChange={setCategory} disabled={!entityId}>
                    <SelectTrigger><SelectValue placeholder="Selecciona categoría" /></SelectTrigger>
                    <SelectContent>
                      {availableCategories.map((c) => (
                        <SelectItem key={c.id} value={c.nombre}>{c.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* SUBCATEGORÍA */}
                <div>
                  <Label>Subcategoría</Label>
                  <Select value={subcategory} onValueChange={setSubcategory} disabled={!category}>
                    <SelectTrigger><SelectValue placeholder="Selecciona subcategoría" /></SelectTrigger>
                    <SelectContent>
                      {availableSubcategories.map((s, i) => <SelectItem key={i} value={s.nombre}>{s.nombre}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Descripción</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe tu reclamo..." />
              </div>

              <div>
                <Label>Ubicación</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Dirección, ciudad, etc." />
              </div>

              <div>
                <Label>Imagen</Label>
                <input type="file" accept="image/*" onChange={handlePhotoChange} />
                {photoPreview && (
                  <div className="relative mt-2 w-64 h-40">
                    <img src={photoPreview} className="object-cover w-full h-full rounded-md" />
                    <Button onClick={removePhoto} className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white">
                      <X size={16} />
                    </Button>
                  </div>
                )}
              </div>

              <Button type="submit" disabled={loading}>{loading ? "Creando..." : "Crear Reclamo"}</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
