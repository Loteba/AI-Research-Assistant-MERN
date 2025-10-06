// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
// Importa ambas funciones
const { registerUser, loginUser } = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser); // <--- Añade esta nueva ruta

module.exports = router;