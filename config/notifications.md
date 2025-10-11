# Configuración de Notificaciones por Email

## Variables de Entorno Requeridas

Agrega estas variables a tu archivo `.env.local`:

```bash
# URL base de la aplicación
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Configuración de n8n
N8N_WEBHOOK_URL="http://localhost:5678/webhook"
```

## Configuración de n8n

### 1. Credenciales de Email en n8n

Ve a **Settings** > **Credentials** en n8n y crea una credencial de tipo **Email** con:

- **SMTP Host**: `smtp.gmail.com` (para Gmail)
- **SMTP Port**: `587`
- **Username**: tu-email@gmail.com
- **Password**: tu contraseña de aplicación de Gmail

### 2. URLs de Webhook

Una vez configurados los workflows en n8n, las URLs serán:
- Creación: `http://localhost:5678/webhook/complaint-created`
- Cierre: `http://localhost:5678/webhook/complaint-closed`

## Flujo de Notificaciones

1. **Usuario crea reclamo** → Sistema envía webhook a n8n → n8n envía email de confirmación
2. **Admin cierra reclamo** → Sistema envía webhook a n8n → n8n envía email de cierre

## Pruebas

Para probar el sistema:

1. Asegúrate de que n8n esté ejecutándose en `http://localhost:5678`
2. Configura los workflows según la guía en `n8n-setup-guide.md`
3. Crea un reclamo en la aplicación
4. Verifica que llegue el email de confirmación
5. Cierra el reclamo desde el panel de admin
6. Verifica que llegue el email de cierre

