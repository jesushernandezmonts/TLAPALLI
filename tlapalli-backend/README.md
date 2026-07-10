# 🌮 TLAPALLI - Centro Cultural Huamantla

Sistema de gestión integral para el centro cultural **Tlapalli** en Huamantla, Tlaxcala.

## 📋 Descripción

Plataforma web para la administración de:
- **Alumnos**: Registro, expediente digital, documentos
- **Talleres**: Catálogo, cupos, horarios, costos
- **Instructores**: Perfiles, asignación a talleres, estados
- **Inscripciones**: Registro de alumnos a talleres, control de pagos
- **Asistencias**: Pase de lista por grupo
- **Pagos**: Control de mensualidades, métodos de pago
- **Reportes**: Estadísticas generales, financieras, alumnos
- **Servicio Social**: Control de horas y actividades
- **Portal del Alumno**: Acceso a información personal, pagos y servicio social

## 🏗️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Backend** | NestJS 11 + TypeScript |
| **Frontend** | React 19 + Vite 8 + Tailwind CSS 4 |
| **Base de datos** | PostgreSQL (Neon) |
| **Autenticación** | JWT + Passport + Google OAuth 2.0 |
| **Email** | SendGrid / Nodemailer |
| **Archivos** | Cloudinary |
| **Tiempo real** | Socket.IO |
| **Documentación API** | Swagger UI |

## 🚀 Requisitos

- Node.js 20+
- npm 9+
- PostgreSQL (recomendado: Neon)

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd proyecto_estadias
```

### 2. Configurar Backend

```bash
cd tlapalli-backend
npm install

# Copiar variables de entorno y configurar
cp .env.example .env
# Editar .env con tus credenciales
```

### 3. Configurar Frontend

```bash
cd tlapalli-frontend
npm install
```

### 4. Base de datos

```bash
cd tlapalli-backend
npx prisma generate
npx prisma migrate dev
npm run seed
```

### 5. Iniciar desarrollo

```bash
# Terminal 1: Backend
cd tlapalli-backend
npm run start:dev

# Terminal 2: Frontend
cd tlapalli-frontend
npm run dev
```

## 🌐 URLs de desarrollo

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api/health

## 📦 Producción

### Backend (Koyeb)

```bash
cd tlapalli-backend
npm run build
# Desplegar en Koyeb usando koyeb.yaml
```

**Variables de entorno requeridas en producción:**

```
DATABASE_URL, DIRECT_URL, JWT_SECRET, REFRESH_TOKEN_SECRET,
FRONTEND_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET,
GOOGLE_CALLBACK_URL, CLOUDINARY_CLOUD_NAME,
CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
```

### Frontend (Vercel)

```bash
cd tlapalli-frontend
npm run build
# Desplegar en Vercel conectando el repositorio
```

**Variables de entorno requeridas:**
```
VITE_API_URL=https://tlapalli-backend.koyeb.app
```

## 🧪 Tests

```bash
cd tlapalli-backend
npm run test        # Unit tests
npm run test:e2e    # E2E tests
npm run test:cov    # Coverage
```

## 📖 Documentación API

La documentación interactiva de la API está disponible en `/api/docs` cuando el servidor está corriendo.

## 🔐 Roles de Usuario

- **admin**: Acceso completo al sistema
- **profesor**: Gestión de grupos, asistencias y pagos
- **alumno**: Portal personal con información propia

## 🛡️ Seguridad

- Autenticación JWT con refresh tokens (httpOnly cookies)
- Rate limiting global y específico por endpoint
- Bloqueo por intentos fallidos de login
- Helmet para cabeceras HTTP seguras
- Validación de entrada con whitelist
- Filtro global de excepciones

## 📄 Licencia

UNLICENSED - Proyecto privado
