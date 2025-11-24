
# AI Research Assistant – Proyectify AI

Monorepo del proyecto **AI Research Assistant / ProyectifyIA**, que integra:

- **Backend:** Node.js + Express + MongoDB + JWT
- **Frontend:** React (gestion-proyectos-frontend)
- **IA:** Integración con APIs de modelos de lenguaje (resúmenes, chatbot, sugerencias)
- **Mock API:** JSON Server
- **Pruebas:** Jest + Supertest + React Testing Library
- **Software Verde:** Scripts de medición con Lighthouse / GreenFrame-like

---

## 1. Requisitos Previos

Asegúrate de tener instalado:

- **Node.js** ≥ 18.x  
- **npm** ≥ 9.x  
- **Git**  
- (Opcional) **MongoDB local** o una URL de MongoDB Atlas  
- (Opcional) Cuenta en **Railway**, **Render** u otro proveedor cloud

---

## 2. Clonar el repositorio

```bash
# Clonar el monorepo
git clone https://github.com/usuario/AI-Research-Assistant.git
cd AI-Research-Assistant
````

> Reemplaza la URL por la de tu repositorio real si es distinta.

---

## 3. Estructura del proyecto

```text
AI-Research-Assistant/
├── backend/                     # API REST (Node/Express/Mongo)
│   ├── src/
│   ├── tests/
│   └── package.json
├── gestion-proyectos-frontend/  # Frontend React
│   ├── src/
│   └── package.json
├── db.json                      # Mock API (JSON Server)
├── json-server-config.json
├── tools/                       # Scripts de medición energética
│   ├── measure-energy.js
│   └── compare-energy.js
└── package.json                 # Scripts de raíz
```

---

## 4. Variables de entorno

### 4.1. Backend (`backend/.env`)

Crea un archivo `.env` dentro de la carpeta `backend` con al menos:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/ai_research_assistant

JWT_SECRET=tu_clave_secreta_jwt
JWT_EXPIRES_IN=7d

# Opcionales: Integración con IA y correo
OPENAI_API_KEY=tu_clave_openai
MAIL_HOST=smtp.ejemplo.com
MAIL_PORT=587
MAIL_USER=usuario@ejemplo.com
MAIL_PASS=clave_segura
```

### 4.2. Frontend (`gestion-proyectos-frontend/.env`)

En la carpeta del frontend, crea:

```env
REACT_APP_API_URL=http://localhost:3000
```

Si despliegas el backend en la nube, cambia esta URL por el dominio público del backend.

---

## 5. Instalación de dependencias

### 5.1. Backend

```bash
cd backend
npm install
```

### 5.2. Frontend

```bash
cd ../gestion-proyectos-frontend
npm install
```

---

## 6. Ejecución local

### 6.1. Levantar el backend

Desde la carpeta `backend`:

```bash
cd backend
npm start
```

Por defecto levantará la API en:

```text
http://localhost:3000
```

### 6.2. Levantar el frontend

En otra terminal, desde la raíz o directamente:

```bash
cd gestion-proyectos-frontend
npm start
```

Por defecto abrirá:

```text
http://localhost:3000  (si usa proxy)
http://localhost:3001 o similar según configuración de React
```

Asegúrate de que `REACT_APP_API_URL` apunte a la URL real del backend.

---

## 7. Mock API con JSON Server (opcional)

El proyecto incluye un **Mock API** para pruebas rápidas sin depender del backend real.

Desde la raíz del monorepo:

```bash
npm run mock:start
```

Esto levantará JSON Server en:

```text
http://localhost:3001
```

Endpoints de ejemplo:

* `GET /projects`
* `GET /users`
* `GET /tasks?projectId=1`
* etc.

> Configurado mediante `db.json` y `json-server-config.json`.

---

## 8. Pruebas de software

### 8.1. Backend – Jest + Supertest

Desde `backend`:

```bash
# Todas las pruebas con cobertura
npm test

# Solo pruebas unitarias
npm run test:unit

# Solo pruebas de integración
npm run test:integration
```

Los reportes de cobertura se generan en la carpeta:

```text
backend/coverage/
```

### 8.2. Frontend – React Testing Library

Desde `gestion-proyectos-frontend`:

```bash
# Ejecutar pruebas de frontend
npm test
```

---

## 9. Pruebas de API (Postman / cURL)

La API se puede probar con Postman o cURL. Ejemplos:

### 9.1. Registro de usuario

```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Marlon Bonifacio", "email": "marlon.bonifacio@ejemplo.com", "password": "ClaveSegura_Bonifacio"}'
```

### 9.2. Login

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"marlon.bonifacio@ejemplo.com","password":"ClaveSegura_Bonifacio"}'
```

> Puedes incluir una colección de Postman en `docs/` si deseas compartir todos los endpoints.

---

## 10. Medición de eficiencia energética (Software Verde)

Desde la raíz del repositorio:

```bash
# Medir consumo aproximado de energía (Lighthouse)
npm run energy:measure

# Comparar componente optimizado vs estándar
npm run energy:compare
```

Los reportes se guardan en:

```text
energy-reports/
```

---

## 11. Despliegue en Railway

Se recomienda crear **dos servicios** en Railway a partir de este monorepo:

### 11.1. Backend (API)

* **Root directory:** `backend`
* **Start command:**

```bash
npm start
```

* Configurar variables de entorno en Railway:

  * `PORT`
  * `MONGO_URI`
  * `JWT_SECRET`
  * `OPENAI_API_KEY` (si aplica)
  * Credenciales de correo (si se usa recuperación de contraseña)

### 11.2. Frontend (React)

* **Root directory:** `gestion-proyectos-frontend`
* **Build command:**

```bash
npm run build
```

* **Start command:**

```bash
npm run start:prod
```

El script `start:prod` usa `serve` para publicar la carpeta `build` en el puerto que expone Railway.

Configura en Railway:

```env
REACT_APP_API_URL=https://tu-dominio-backend.railway.app
```

---

## 12. Scripts útiles (resumen)

### En `backend`

```bash
npm start           # Iniciar API en modo desarrollo/producción simple
npm test            # Ejecutar todas las pruebas con cobertura
npm run test:unit   # Pruebas unitarias
npm run test:integration   # Pruebas de integración
```

### En `gestion-proyectos-frontend`

```bash
npm start           # Ejecutar frontend en desarrollo
npm run build       # Construir versión de producción
npm run start:prod  # Servir la build (usa 'serve')
```

### En la raíz del monorepo

```bash
npm run mock:start      # Levantar Mock API (JSON Server)
npm run energy:measure  # Medir energía (Lighthouse)
npm run energy:compare  # Comparar componentes (Green vs estándar)
```

---

## 13. Notas finales

* Antes de ejecutar pruebas o scripts de energía, asegúrate de que **backend**, **frontend** y (si aplica) **mock API** estén correctamente configurados.
* Para entornos de producción, revisa y endurece la configuración de:

  * CORS
  * Seguridad de JWT
  * Políticas de cookies/sesión
  * Logs y monitoreo

> Este README está pensado para servir como guía rápida de instalación, ejecución, pruebas y despliegue del proyecto AI Research Assistant / ProyectifyIA.

```

