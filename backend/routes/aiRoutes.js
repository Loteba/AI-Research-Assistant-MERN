// backend/routes/aiRoutes.js
const express = require('express');
const router = express.Router();

const {
  summarizeText,   // Resumir texto con IA
  handleChat,      // Chatbot con IA
  suggestArticles  // Sugerencias de artículos (Google Scholar vía SerpAPI)
} = require('../controllers/aiController');

const { protect } = require('../middleware/authMiddleware');

// Endpoints protegidos con JWT
router.post('/summarize', protect, summarizeText);
router.post('/chat', protect, handleChat);
router.post('/suggest-articles', protect, suggestArticles);

module.exports = router;
