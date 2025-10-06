import API from '../../services/apiClient';
import { aiChat, aiSummarizeText, suggestArticles } from '../../services/aiService';

jest.mock('../../services/apiClient');

describe('aiService', () => {
  beforeEach(() => jest.resetAllMocks());

  test('aiChat devuelve texto correctamente', async () => {
    API.post.mockResolvedValue({ data: { text: 'respuesta' } });
    const res = await aiChat({ message: 'hola' });
    expect(API.post).toHaveBeenCalledWith('/ai/chat', { message: 'hola', history: [] });
    expect(res.text).toBe('respuesta');
  });

  test('aiSummarizeText retorna summary', async () => {
    API.post.mockResolvedValue({ data: { summary: 'sum' } });
    const res = await aiSummarizeText({ text: 'largo' });
    expect(API.post).toHaveBeenCalledWith('/ai/summarize', { text: 'largo', prompt: undefined });
    expect(res.summary).toBe('sum');
  });

  test('suggestArticles transforma range en yearFrom', async () => {
    API.post.mockResolvedValue({ data: { results: [{ title: 'a' }] } });
    const res = await suggestArticles('query', '5');
    expect(API.post).toHaveBeenCalledWith('/ai/suggest-articles', expect.any(Object));
    expect(Array.isArray(res)).toBe(true);
    expect(res[0].title).toBe('a');
  });
});
