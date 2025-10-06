import API from '../../services/apiClient';
import libraryService, { getItems, uploadItem, saveSuggestion } from '../../services/libraryService';

jest.mock('../../services/apiClient');

describe('libraryService', () => {
  beforeEach(() => jest.resetAllMocks());

  test('getItems maneja firma antigua y nueva', async () => {
    API.get.mockResolvedValue({ data: [{ title: 'x' }] });
    const res1 = await getItems(''); // new
    expect(API.get).toHaveBeenCalledWith('/library', { params: { search: undefined } });
    expect(Array.isArray(res1)).toBe(true);

    API.get.mockResolvedValue({ data: [{ title: 'y' }] });
    const res2 = await getItems('token', 'buscar'); // old signature
    expect(API.get).toHaveBeenCalledWith('/library', { params: { search: 'buscar' } });
  });

  test('uploadItem llama a post multipart', async () => {
    const form = new FormData();
    form.append('a', 'b');
    API.post.mockResolvedValue({ data: { ok: true } });
    const res = await uploadItem(form);
    expect(API.post).toHaveBeenCalledWith('/library', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    expect(res.ok).toBe(true);
  });

  test('saveSuggestion usa fallback cuando 404', async () => {
    API.post
      .mockRejectedValueOnce({ response: { status: 404 } })
      .mockResolvedValueOnce({ data: { saved: true } });

    const res = await saveSuggestion({ title: 't', link: 'l' });
    expect(API.post).toHaveBeenCalled();
    expect(res.saved).toBe(true);
  });
});
