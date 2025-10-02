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

```bash
AI-Research-Assistant-MERN/
│── backend/
│   ├── controllers/       # Lógica de negocio (AI, Projects, Library, Users)
│   ├── models/            # Modelos Mongoose
│   ├── routes/            # Rutas de API REST
│   ├── middleware/        # Autenticación JWT, manejo de errores
│   ├── config/            # Configuración de DB
│   └── server.js          # Entrada del backend
│
│── frontend/
│   ├── src/
│   │   ├── components/    # Componentes (IA, proyectos, biblioteca, layout)
│   │   ├── context/       # AuthContext
│   │   ├── pages/         # Páginas principales
│   │   ├── services/      # API clients (Axios)
│   │   └── App.js         # Rutas y layout principal
│   └── package.json
│
│── .env                   # Variables de entorno (IGNORADO en Git)
│── README.md              # Documentación
