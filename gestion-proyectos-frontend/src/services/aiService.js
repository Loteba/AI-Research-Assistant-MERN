// src/services/aiService.js
import API from './apiClient';

// === IA: Resumen de texto ===
export const aiSummarizeText = async ({ text, prompt }) => {
  const { data } = await API.post('/ai/summarize', { text, prompt });
  return data; // { summary, model }
};

// === IA: Chat ===
export const aiChat = async ({ message, history = [] }) => {
  const { data } = await API.post('/ai/chat', { message, history });
  return data; // { text, model }
};

// === IA: Sugerencia de artículos (nueva) ===
export const aiSuggestArticles = async ({ query, yearFrom, num }) => {
  const { data } = await API.post('/ai/suggest-articles', { query, yearFrom, num });
  // data => { results: [...] }
  return data;
};

// === Legacy shim para compatibilidad con ArticleSuggester actual ===
// Firma esperada: suggestArticles(query, year, token)
// - query: string
// - year: "5" => últimos 5 años (se convierte a yearFrom)
// - token: ignorado (el interceptor ya mete el Authorization)
const yearFromByRange = (range) => {
  const now = new Date().getFullYear();
  if (!range) return undefined;
  const n = Number(range);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return now - n + 1; // incluye año actual
};

export const suggestArticles = async (query, year /* , token */) => {
  const yearFrom = yearFromByRange(year);
  const { results } = await aiSuggestArticles({ query, yearFrom, num: 5 });
  // Devuelve directamente el array que espera tu UI (resultId, title, authors, summary, link, year, pdfUrl)
  return results || [];
};

// Export default para imports antiguos: aiService.X
export default {
  aiSummarizeText,
  aiChat,
  aiSuggestArticles,
  suggestArticles, // <- legacy
};
