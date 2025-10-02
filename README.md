# 📚 AI Research Assistant MERN  

Un **asistente de investigación académico** desarrollado con el stack **MERN** (MongoDB, Express, React, Node.js) que integra **Inteligencia Artificial (Gemini API)** y **Google Scholar (vía SerpAPI)** para apoyar a investigadores y estudiantes en:  

- 🔍 **Sugerencia de artículos científicos** (búsqueda en Google Scholar con filtros por fecha).  
- ✍️ **Resúmenes automáticos de textos** con IA (Google Gemini).  
- 🤖 **Chatbot de investigación** asistido por IA para responder preguntas contextuales.  
- 📂 **Biblioteca personal** para guardar PDFs y artículos.  
- 📊 **Gestión de proyectos y tareas** de investigación en un solo entorno.  

---

## 🚀 Funcionalidades principales

### 📝 **Gestión de proyectos**
- Crear, editar y eliminar proyectos.  
- Organización por **área temática** y descripción.  
- Gestión de **tareas** vinculadas a cada proyecto.  

### 📖 **Biblioteca personal**
- Subida de PDFs a la nube (integración con Dropbox).  
- Búsqueda dentro de la biblioteca personal por título, resumen o etiquetas.  
- Guardado de artículos sugeridos desde el buscador de IA.  

### 🤖 **Asistente de IA**
- **Chatbot de investigación**: interactúa en tiempo real, recuerda contexto de la conversación.  
- **Resumidor automático**: genera resúmenes claros y estructurados (objetivos, método, hallazgos, limitaciones, citas).  

### 🔍 **Sugerencia de artículos**
- Conexión con **Google Scholar vía SerpAPI**.  
- Filtrado por año de publicación.  
- Resultados con título, autores, resumen, link directo y opción de **guardar en biblioteca**.  

---

## 🛠️ Tecnologías utilizadas

- **Frontend**: React 19, React Router v7, Context API, Axios, React Icons.  
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT Authentication.  
- **IA**: Google Gemini API (`@google/genai`).  
- **Búsqueda académica**: Google Scholar (SerpAPI).  
- **Almacenamiento de PDFs**: Dropbox API.  
- **Otros**: Multer, bcrypt, dotenv, cors.  

---

## 📂 Estructura del proyecto
AI-Research-Assistant-MERN/
│── backend/
│ ├── controllers/ # Lógica de negocio (AI, Projects, Library, Users)
│ ├── models/ # Modelos Mongoose
│ ├── routes/ # Rutas de API REST
│ ├── middleware/ # Autenticación JWT, manejo de errores
│ ├── config/ # Configuración de DB
│ └── server.js # Entrada del backend
│
│── frontend/
│ ├── src/
│ │ ├── components/ # Componentes (IA, proyectos, biblioteca, layout)
│ │ ├── context/ # AuthContext
│ │ ├── pages/ # Páginas principales
│ │ ├── services/ # API clients (Axios)
│ │ └── App.js # Rutas y layout principal
│ └── package.json
│
│── .env # Variables de entorno (IGNORADO en Git)
│── README.md # Documentación


---

## ⚙️ Instalación y configuración

1. **Clonar repositorio**
   ```bash
   git clone https://github.com/TU-USUARIO/AI-Research-Assistant-MERN.git
   cd AI-Research-Assistant-MERN

Configurar backend

cd backend
cd backend
npm install

Crear archivo .env con:

NODE_ENV=development
PORT=5000
MONGO_URI=tu_cadena_mongo
JWT_SECRET=tu_jwt_secret

GOOGLE_API_KEY=tu_api_key_gemini
SERPAPI_API_KEY=tu_api_key_serpapi
DROPBOX_ACCESS_TOKEN=tu_token_dropbox


Configurar frontend

cd ../frontend
npm install
npm start

🌐 Uso

Registro/Login de usuario
Autenticación con JWT.

Dashboard

Crear proyectos de investigación.

Añadir tareas a proyectos.

Gestionar biblioteca de PDFs y artículos.

Asistente IA

Resumir textos académicos.

Buscar artículos en Google Scholar.

Guardar artículos directamente en la biblioteca.

Conversar con el chatbot para obtener apoyo en la investigación.

📸 Capturas de pantalla

<img width="1895" height="931" alt="image" src="https://github.com/user-attachments/assets/62d6028e-0651-4abd-8db5-1c8382cee39f" />
<img width="468" height="748" alt="image" src="https://github.com/user-attachments/assets/cc506ce4-f00b-4846-8b6c-da19dd119fb0" />
<img width="1911" height="940" alt="image" src="https://github.com/user-attachments/assets/c079f243-2e31-4b93-8524-64162cf787b3" />
<img width="1911" height="940" alt="image" src="https://github.com/user-attachments/assets/8b281170-4bc8-4591-b89f-fbd472758b0d" />
<img width="1915" height="925" alt="image" src="https://github.com/user-attachments/assets/2cdb1070-869d-4f2b-a780-7e93cbad5f98" />




📌 Roadmap (próximos pasos)

 Etiquetado automático de artículos con IA.

 Exportación de citas en formato APA / IEEE.

 Colaboración multiusuario en proyectos.

 Panel de estadísticas de progreso de investigación.

👨‍💻 Autor

Desarrollado por Loteba JkS

Proyecto académico y de investigación – 2025.
