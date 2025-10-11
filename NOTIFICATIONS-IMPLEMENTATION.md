# 📧 Sistema de Notificaciones por Email - Implementación Completa

## ✅ Lo que se ha implementado

### 1. **Webhook de Notificaciones** (`app/api/webhooks/complaint-notifications/route.ts`)
- Endpoint que recibe notificaciones de creación y cierre de reclamos
- Obtiene información completa del reclamo desde la base de datos
- Envía datos estructurados a n8n para procesamiento
- Manejo robusto de errores

### 2. **Integración en Creación de Reclamos** (`app/api/complaints/route.ts`)
- Se agregó notificación automática cuando se crea un reclamo
- Envía webhook a n8n con datos del reclamo y usuario
- No falla la creación si falla la notificación

### 3. **Integración en Cierre de Reclamos** (`app/api/auth/complaints/route.ts`)
- Se agregó notificación automática cuando se cierra un reclamo
- Diferencia entre cierre y reapertura de reclamos
- Envía webhook a n8n con datos actualizados

### 4. **Documentación Completa**
- `n8n-setup-guide.md`: Guía paso a paso para configurar n8n
- `config/notifications.md`: Configuración de variables de entorno
- `scripts/test-notifications.js`: Script de pruebas

## 🔄 Flujo de Notificaciones

```
Usuario crea reclamo
    ↓
Sistema guarda reclamo en BD
    ↓
Sistema envía webhook a n8n
    ↓
n8n procesa datos y envía email
    ↓
Usuario recibe email de confirmación

Admin cierra reclamo
    ↓
Sistema actualiza estado en BD
    ↓
Sistema envía webhook a n8n
    ↓
n8n procesa datos y envía email
    ↓
Usuario recibe email de cierre
```

## 📋 Datos que se envían a n8n

```json
{
  "complaintId": "uuid-del-reclamo",
  "action": "created|closed|reopened",
  "userEmail": "usuario@email.com",
  "userName": "Nombre del Usuario",
  "complaintTitle": "Título del Reclamo",
  "complaintDescription": "Descripción del Reclamo",
  "complaintCategory": "Categoría",
  "complaintSubcategory": "Subcategoría",
  "complaintLocation": "Ubicación",
  "complaintStatus": "open|closed",
  "entityName": "Nombre de la Entidad",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🚀 Pasos para Activar

### 1. **Configurar Variables de Entorno**
```bash
# En tu archivo .env.local
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
N8N_WEBHOOK_URL="http://localhost:5678/webhook"
```

### 2. **Configurar n8n**
1. Abrir n8n en `http://localhost:5678`
2. Seguir la guía en `n8n-setup-guide.md`
3. Configurar credenciales de email
4. Crear los dos workflows (creación y cierre)
5. Activar los workflows

### 3. **Probar el Sistema**
```bash
# Ejecutar script de pruebas
node scripts/test-notifications.js
```

## 📧 Tipos de Email

### **Email de Confirmación (Reclamo Creado)**
- **Asunto**: "✅ Tu reclamo ha sido recibido - Sistema de Reclamos"
- **Contenido**: Confirmación de recepción con detalles del reclamo
- **Estado**: Informa que el reclamo está "Abierto"

### **Email de Cierre (Reclamo Cerrado)**
- **Asunto**: "🔒 Tu reclamo ha sido cerrado - Sistema de Reclamos"
- **Contenido**: Notificación de cierre con detalles del reclamo
- **Estado**: Informa que el reclamo está "Cerrado"

## 🛠️ Características Técnicas

- **Robustez**: Si falla el envío de email, no afecta la funcionalidad principal
- **Logging**: Registra todos los intentos de notificación
- **Flexibilidad**: Fácil de personalizar templates de email en n8n
- **Escalabilidad**: n8n puede manejar múltiples notificaciones simultáneamente
- **Mantenimiento**: Fácil de modificar sin tocar el código de la aplicación

## 🔧 Solución de Problemas

### **No llegan los emails**
1. Verificar que n8n esté ejecutándose
2. Revisar credenciales de email en n8n
3. Verificar que los workflows estén activos
4. Revisar logs de n8n

### **Webhooks no se ejecutan**
1. Verificar URLs de webhook en n8n
2. Revisar logs de la aplicación
3. Verificar que las variables de entorno estén configuradas

### **Errores en la aplicación**
1. Revisar logs del servidor
2. Verificar que la base de datos esté funcionando
3. Verificar que las rutas de API estén correctas

## 📈 Próximos Pasos Opcionales

- **Templates personalizados**: Crear templates más elaborados en n8n
- **Notificaciones SMS**: Agregar notificaciones por SMS
- **Dashboard de notificaciones**: Panel para ver estadísticas de emails enviados
- **Configuración por usuario**: Permitir que usuarios configuren sus preferencias de notificación

