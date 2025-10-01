const express = require('express');
const colors = require('colors');
const dotenv = require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
const path = require('path');

connectDB();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/library', require('./routes/libraryRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../gestion-proyectos-frontend/build')));
    app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, '../', 'gestion-proyectos-frontend', 'build', 'index.html')));
} else {
    app.get('/', (req, res) => res.send('API corriendo en modo de desarrollo'));
}

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor iniciado en el puerto ${PORT}`.cyan.underline));

// --- logger simple de cada request ---
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});
