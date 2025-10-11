// Script para probar las notificaciones de reclamos
// Ejecutar con: node scripts/test-notifications.js

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function testNotificationWebhook() {
  console.log('🧪 Probando webhook de notificaciones...\n');

  // Datos de prueba para reclamo creado
  const createdData = {
    complaintId: 'test-complaint-123',
    action: 'created',
    userEmail: 'test@example.com',
    complaintTitle: 'Reclamo de prueba',
    complaintDescription: 'Este es un reclamo de prueba para verificar las notificaciones'
  };

  // Datos de prueba para reclamo cerrado
  const closedData = {
    complaintId: 'test-complaint-123',
    action: 'closed',
    userEmail: 'test@example.com',
    complaintTitle: 'Reclamo de prueba',
    complaintDescription: 'Este es un reclamo de prueba que ha sido cerrado'
  };

  try {
    // Probar notificación de creación
    console.log('📧 Probando notificación de creación...');
    const createdResponse = await fetch(`${BASE_URL}/api/webhooks/complaint-notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createdData)
    });

    if (createdResponse.ok) {
      const result = await createdResponse.json();
      console.log('✅ Notificación de creación exitosa:', result.message);
    } else {
      console.log('❌ Error en notificación de creación:', createdResponse.status);
    }

    // Probar notificación de cierre
    console.log('\n📧 Probando notificación de cierre...');
    const closedResponse = await fetch(`${BASE_URL}/api/webhooks/complaint-notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(closedData)
    });

    if (closedResponse.ok) {
      const result = await closedResponse.json();
      console.log('✅ Notificación de cierre exitosa:', result.message);
    } else {
      console.log('❌ Error en notificación de cierre:', closedResponse.status);
    }

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
  }
}

async function testN8nConnection() {
  console.log('\n🔗 Probando conexión con n8n...');
  
  try {
    const response = await fetch('http://localhost:5678/api/health');
    if (response.ok) {
      console.log('✅ n8n está ejecutándose correctamente');
    } else {
      console.log('⚠️ n8n no está respondiendo correctamente');
    }
  } catch (error) {
    console.log('❌ n8n no está ejecutándose o no es accesible');
    console.log('   Asegúrate de que n8n esté ejecutándose en http://localhost:5678');
  }
}

async function main() {
  console.log('🚀 Iniciando pruebas del sistema de notificaciones\n');
  
  await testN8nConnection();
  await testNotificationWebhook();
  
  console.log('\n📋 Instrucciones para completar la configuración:');
  console.log('1. Asegúrate de que n8n esté ejecutándose en http://localhost:5678');
  console.log('2. Configura los workflows según n8n-setup-guide.md');
  console.log('3. Configura las credenciales de email en n8n');
  console.log('4. Activa los workflows en n8n');
  console.log('5. Prueba creando un reclamo real en la aplicación');
}

main().catch(console.error);

