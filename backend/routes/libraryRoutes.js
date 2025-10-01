const express = require('express');
const router = express.Router();

// 👇 añade esto
router.use((req, res, next) => {
  console.log(`[LIBRARY ROUTER] ${req.method} ${req.originalUrl}`);
  next();
});

const {
    getLibraryItems,
    uploadLibraryItem,
    deleteLibraryItem,
    saveSuggestedArticle
} = require('../controllers/libraryController');

const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Ruta para la biblioteca global
router.route('/')
    .get(protect, getLibraryItems)
    .post(protect, upload.single('pdfFile'), uploadLibraryItem);

// Ruta para guardar artículos sugeridos
router.route('/save-suggestion')
    .post(protect, saveSuggestedArticle);

// Ruta para eliminar un item específico
router.route('/:id')
    .delete(protect, deleteLibraryItem);

module.exports = router;