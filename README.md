<div align="center">

# 🏛️ Gestor de Reclamos

### Plataforma web para registrar, organizar y dar seguimiento a reclamos ciudadanos

Una aplicación orientada a instituciones y organizaciones que necesitan centralizar solicitudes, facilitar su seguimiento y visualizar información de gestión.

![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=nextdotjs)
![React](https://img.shields.io/badge/React-18-149ECA?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)

**Proyecto de desarrollo de software · Versión sin clasificación automática mediante IA**

</div>

---

## 📌 ¿Qué problema resuelve?

Los reclamos pueden quedar dispersos entre mensajes, formularios y conversaciones, dificultando su organización y seguimiento. **Gestor de Reclamos** reúne la información en un mismo sistema para que las personas puedan registrar situaciones y los administradores consultar su estado y analizar los datos.

La aplicación contempla distintas entidades, como municipalidades, hospitales, instituciones educativas y clubes.

## ✨ Funcionalidades

| Área | Capacidades |
| --- | --- |
| 📝 Registro de reclamos | Título, descripción, entidad, categoría, subcategoría, imagen opcional y referencia de ubicación. |
| 🔎 Consulta y seguimiento | Listado de reclamos, búsqueda por texto y filtros por entidad y estado. |
| 👥 Usuarios y roles | Registro e inicio de sesión; vistas diferenciadas para usuarios y administradores. |
| 👍 Participación | Votos positivos y negativos asociados a los reclamos. |
| 📊 Administración | Indicadores de reclamos abiertos y cerrados, usuarios, gráficos por entidad y actividad reciente. |
| 💬 Ayuda | Preguntas frecuentes almacenadas y administradas en el sistema. |

> **Alcance de esta versión:** no incorpora clasificación automática de reclamos mediante inteligencia artificial. La existencia de un campo de ubicación no implica que se haya verificado una vista de mapa interactivo.

## 🖥️ Recorrido del sistema

**1. Ingreso:** autenticación y navegación según el rol del usuario.

**2. Registro:** carga del reclamo con datos descriptivos, clasificación y ubicación opcional.

**3. Seguimiento:** consulta de reclamos mediante tarjetas, búsqueda, filtros y estados.

**4. Administración:** análisis del volumen de reclamos, distribución por entidades, votos y actividad reciente.

## 📸 Capturas del sistema

Imágenes de demostración del proyecto; no representan un servicio institucional en producción.

### Dashboard de reclamos
![Dashboard de reclamos](assets/capturas/dashboard.png)

### Registro de un reclamo
![Formulario de nuevo reclamo](assets/capturas/formulario-reclamo.png)

### Panel administrativo
![Panel administrativo y estadísticas](assets/capturas/panel-administracion.png)

## 🧰 Tecnologías utilizadas

| Capa | Herramientas |
| --- | --- |
| Interfaz | Next.js 15, React 18, TypeScript |
| Estilos y componentes | Tailwind CSS, Radix UI, lucide-react |
| Persistencia | PostgreSQL, Prisma ORM |
| Formularios y validación | React Hook Form, Zod |
| Gráficos | Recharts |
| Autenticación | Implementación propia basada en usuarios, roles y contraseñas almacenadas con hash |

## 🏗️ Organización general

```text
app/
├── admin/        # Panel administrativo
├── api/          # Rutas y servicios del servidor
├── auth/         # Acceso y registro
├── complaints/   # Gestión de reclamos
├── dashboard/    # Vista de usuario
└── profile/      # Perfil
components/       # Componentes reutilizables
contexts/         # Estado compartido / autenticación
lib/              # Utilidades y lógica auxiliar
prisma/           # Esquema, migraciones y datos de ejemplo
types/            # Tipos TypeScript
```

## 🚀 Ejecución local

**Requisitos:** Node.js, npm y una instancia de PostgreSQL.

1. Cloná el repositorio y entrá en su carpeta.
2. Instalá las dependencias:

   ```bash
   npm install
   ```

3. Configurá un archivo `.env` local con una conexión de base de datos válida (no lo subas a GitHub):

   ```dotenv
   DATABASE_URL="postgresql://USUARIO:CONTRASENA@localhost:5432/gestor_reclamos?schema=public"
   ```

4. Aplicá las migraciones existentes y generá el cliente Prisma:

   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

5. Iniciá el servidor:

   ```bash
   npm run dev
   ```

Abrí [http://localhost:3000](http://localhost:3000).

> Estos pasos describen la configuración básica. Según la instalación, pueden requerirse datos iniciales y ajustes adicionales. El repositorio incluye un script `npm run seed` para carga de datos de ejemplo; revisá su contenido antes de ejecutarlo.

## 🔐 Consideraciones de seguridad y estado

- Utilizá datos de demostración y credenciales propias en entornos de prueba.
- No publiques archivos `.env`, conexiones de base de datos ni información de personas reales.
- La presencia de autenticación y roles en el código no constituye por sí sola una auditoría de seguridad.
- Este repositorio refleja una versión del proyecto y no representa un servicio institucional en producción.
- No se afirma una integración con IA ni un mapa interactivo sin validación en esta versión.

## 👨‍💻 Autor

**Matías Borsini** — Desarrollo de Software

[GitHub](https://github.com/MatiasBorsini) · [LinkedIn](https://www.linkedin.com/in/matias-borsini-92964744b/)

---

<div align="center">
  <sub>Proyecto académico y de portafolio · Documentación basada en el código disponible en esta versión.</sub>
</div>
