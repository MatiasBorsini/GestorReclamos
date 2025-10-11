# Guía de Configuración de n8n para Notificaciones de Reclamos

## 📋 Resumen
Esta guía te ayudará a configurar n8n para enviar emails automáticos cuando se crean y cierran reclamos en el sistema.

## 🔧 Configuración Inicial

### 1. Acceder a n8n
- Abre tu navegador y ve a `http://localhost:5678`
- Crea una cuenta de administrador si es la primera vez

### 2. Configurar Credenciales de Email
1. Ve a **Settings** > **Credentials**
2. Crea una nueva credencial de tipo **Email**
3. Configura tu proveedor de email (Gmail, Outlook, etc.)

## 📧 Workflow 1: Notificación de Reclamo Creado

### Configuración del Webhook
1. Crea un nuevo workflow
2. Agrega un nodo **Webhook**
3. Configura:
   - **HTTP Method**: POST
   - **Path**: `/complaint-created`
   - **Response Mode**: "Respond to Webhook"

### Configuración del Email
1. Agrega un nodo **Email Send** después del webhook
2. Configura:
   - **To Email**: `{{ $json.userEmail }}`
   - **Subject**: "✅ Tu reclamo ha sido recibido - Sistema de Reclamos"
   - **Text/HTML Content**:
   ```html
   <h2>¡Hola {{ $json.userName }}!</h2>
   
   <p>Hemos recibido tu reclamo y queremos confirmarte que será revisado por nuestro equipo.</p>
   
   <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
     <h3>Detalles del Reclamo:</h3>
     <p><strong>Título:</strong> {{ $json.complaintTitle }}</p>
     <p><strong>Descripción:</strong> {{ $json.complaintDescription }}</p>
     <p><strong>Categoría:</strong> {{ $json.complaintCategory }}</p>
     <p><strong>Subcategoría:</strong> {{ $json.complaintSubcategory }}</p>
     <p><strong>Entidad:</strong> {{ $json.entityName }}</p>
     <p><strong>Estado:</strong> <span style="color: #28a745;">Abierto</span></p>
     <p><strong>Fecha de creación:</strong> {{ $json.createdAt }}</p>
   </div>
   
   <p>Nuestro equipo revisará tu reclamo y te mantendremos informado sobre cualquier actualización.</p>
   
   <p>Gracias por usar nuestro sistema de reclamos.</p>
   
   <hr>
   <p style="color: #6c757d; font-size: 12px;">
     Este es un mensaje automático del Sistema de Reclamos.
   </p>
   ```

## 📧 Workflow 2: Notificación de Reclamo Cerrado

### Configuración del Webhook
1. Crea otro workflow
2. Agrega un nodo **Webhook**
3. Configura:
   - **HTTP Method**: POST
   - **Path**: `/complaint-closed`
   - **Response Mode**: "Respond to Webhook"

### Configuración del Email
1. Agrega un nodo **Email Send** después del webhook
2. Configura:
   - **To Email**: `{{ $json.userEmail }}`
   - **Subject**: "🔒 Tu reclamo ha sido cerrado - Sistema de Reclamos"
   - **Text/HTML Content**:
   ```html
   <h2>¡Hola {{ $json.userName }}!</h2>
   
   <p>Te informamos que tu reclamo ha sido cerrado por nuestro equipo de administración.</p>
   
   <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
     <h3>Detalles del Reclamo:</h3>
     <p><strong>Título:</strong> {{ $json.complaintTitle }}</p>
     <p><strong>Descripción:</strong> {{ $json.complaintDescription }}</p>
     <p><strong>Categoría:</strong> {{ $json.complaintCategory }}</p>
     <p><strong>Subcategoría:</strong> {{ $json.complaintSubcategory }}</p>
     <p><strong>Entidad:</strong> {{ $json.entityName }}</p>
     <p><strong>Estado:</strong> <span style="color: #dc3545;">Cerrado</span></p>
     <p><strong>Fecha de cierre:</strong> {{ $json.updatedAt }}</p>
   </div>
   
   <p>Si tienes alguna pregunta sobre este reclamo, no dudes en contactarnos.</p>
   
   <p>Gracias por usar nuestro sistema de reclamos.</p>
   
   <hr>
   <p style="color: #6c757d; font-size: 12px;">
     Este es un mensaje automático del Sistema de Reclamos.
   </p>
   ```

## 🔗 URLs de Webhook

Una vez configurados los workflows, n8n te proporcionará URLs como:
- `http://localhost:5678/webhook/complaint-created`
- `http://localhost:5678/webhook/complaint-closed`

## 🚀 Activación

1. **Activa ambos workflows** en n8n
2. **Copia las URLs de webhook** que n8n te proporciona
3. **Actualiza las URLs** en tu aplicación (si es necesario)

## 🧪 Pruebas

Para probar el sistema:
1. Crea un nuevo reclamo en tu aplicación
2. Verifica que llegue el email de confirmación
3. Cierra el reclamo desde el panel de administración
4. Verifica que llegue el email de cierre

## 📝 Notas Importantes

- Los workflows están configurados para recibir datos JSON con la estructura definida en el webhook
- Los emails incluyen información completa del reclamo
- El sistema es robusto: si falla el envío de email, no afecta la creación/cierre del reclamo
- Puedes personalizar los templates de email según tus necesidades

## 🔧 Solución de Problemas

### Si no llegan los emails:
1. Verifica que las credenciales de email estén correctas
2. Revisa los logs de n8n para errores
3. Asegúrate de que los workflows estén activos
4. Verifica que las URLs de webhook sean correctas

### Si los webhooks no se ejecutan:
1. Verifica que la aplicación esté enviando datos al webhook correcto
2. Revisa la estructura de datos que envía la aplicación
3. Asegúrate de que n8n esté ejecutándose

