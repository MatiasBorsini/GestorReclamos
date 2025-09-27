"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Complaint } from "@/types/complaint"

export default function EditComplaintPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const params = useParams()

  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id
  const id = rawId?.trim().replace(/\r?\n|\r/g, "") || ""

  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [title, setTitle] = useState("")
  const [entityId, setEntityId] = useState<number | null>(null)
  const [category, setCategory] = useState("")
  const [subcategory, setSubcategory] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [availableEntities, setAvailableEntities] = useState<{ id: number; nombre: string }[]>([])
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [availableSubcategories, setAvailableSubcategories] = useState<string[]>([])

  // Cargar entidades
  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const res = await fetch("/api/entities")
        const data = await res.json()
        setAvailableEntities(data) // ahora guardamos objetos { id, nombre }
      } catch (err) {
        console.error(err)
      }
    }
    fetchEntities()
  }, [])

  // Cargar reclamo
  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    const fetchComplaint = async () => {
      try {
        const res = await fetch(`/api/auth/complaints/${id}`)
        if (!res.ok) throw new Error("No se pudo cargar el reclamo")
        const data = await res.json()

        if (data.authorId !== user.id) {
          toast({
            title: "Acceso denegado",
            description: "No puedes editar reclamos de otros usuarios.",
            variant: "destructive",
          })
          router.push("/dashboard")
          return
        }

        setComplaint({
          ...data,
          votes: data.votes || { positive: 0, negative: 0, userVotes: {} },
        })

        setTitle(data.title)
        setEntityId(data.entityId || null) // 🔥 usar entityId
        setCategory(data.category)
        setSubcategory(data.subcategory)
        setDescription(data.description)
        setLocation(data.location || "")
        setPhotoPreview(data.imageUrl || null)
      } catch (err) {
        toast({
          title: "Error",
          description: "No se pudo cargar el reclamo.",
          variant: "destructive",
        })
        router.push("/complaints/my")
      }
    }

    fetchComplaint()
  }, [user, id, router, toast])

  // Cargar categorías
  useEffect(() => {
    if (!entityId) {
      setAvailableCategories([])
      setCategory("")
      setAvailableSubcategories([])
      setSubcategory("")
      return
    }

    const fetchCategories = async () => {
      try {
        const entityName = availableEntities.find((e) => e.id === entityId)?.nombre
        if (!entityName) return
        const res = await fetch(`/api/categories?entity=${encodeURIComponent(entityName)}`)
        const data = await res.json()
        setAvailableCategories(data.map((c: any) => c.nombre))
      } catch (err) {
        console.error(err)
      }
    }
    fetchCategories()
  }, [entityId, availableEntities])

  // Cargar subcategorías
  useEffect(() => {
    if (!entityId || !category) {
      setAvailableSubcategories([])
      setSubcategory("")
      return
    }

    const entityName = availableEntities.find((e) => e.id === entityId)?.nombre
    if (!entityName) return

    const fetchSubcategories = async () => {
      try {
        const res = await fetch(
          `/api/subcategories?entity=${encodeURIComponent(entityName)}&category=${encodeURIComponent(category)}`
        )
        const data = await res.json()
        setAvailableSubcategories(data.map((s: any) => s.nombre))
      } catch (err) {
        console.error(err)
      }
    }
    fetchSubcategories()
  }, [entityId, category, availableEntities])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => setPhotoPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const removePhoto = () => setPhotoPreview(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!title.trim() || !entityId || !category || !subcategory || !description.trim()) {
      setError("Todos los campos obligatorios deben estar completos")
      setLoading(false)
      return
    }

    if (description.length < 20) {
      setError("La descripción debe tener al menos 20 caracteres")
      setLoading(false)
      return
    }

    if (!user) {
      setError("No estás autenticado")
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`/api/auth/complaints/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          entityId, // 🔥 ahora enviamos entityId
          category,
          subcategory,
          description,
          location,
          imageUrl: photoPreview,
          authorId: user.id,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        console.error("❌ Error al actualizar:", error)
        toast({
          title: "Error",
          description: error.error || "No se pudo actualizar el reclamo.",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      toast({
        title: "Reclamo actualizado",
        description: "Los cambios han sido guardados exitosamente.",
      })

      router.push("/complaints/my")
    } catch (err) {
      setError("Error al actualizar el reclamo. Inténtalo nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  if (!user || !complaint) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 md:ml-64">
        <div className="p-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
          </Button>

          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Editar Reclamo</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label>Entidad *</Label>
                  <Select value={entityId?.toString() || ""} onValueChange={(val) => setEntityId(Number(val))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una entidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEntities.map((ent) => (
                        <SelectItem key={ent.id} value={ent.id.toString()}>
                          {ent.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Categoría *</Label>
                  <Select value={category} onValueChange={setCategory} disabled={!entityId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Subcategoría *</Label>
                  <Select value={subcategory} onValueChange={setSubcategory} disabled={!category}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una subcategoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSubcategories.map((subcat) => (
                        <SelectItem key={subcat} value={subcat}>
                          {subcat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Título *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} />
                </div>

                <div className="space-y-2">
                  <Label>Descripción *</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    maxLength={1000}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Ubicación</Label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Foto (Opcional)</Label>
                  {!photoPreview ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <input
                        type="file"
                        id="photo"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("photo")?.click()}
                      >
                        Seleccionar Imagen
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removePhoto}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Guardando cambios..." : "Guardar Cambios"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

