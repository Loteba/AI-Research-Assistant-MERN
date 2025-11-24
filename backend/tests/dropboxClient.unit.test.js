jest.mock('axios');
jest.mock('dropbox', () => ({ Dropbox: function (opts) { this.accessToken = opts.accessToken; } }));

describe('dropboxClient fetchAccessToken and getDropboxClient', () => {
  beforeEach(() => {
    jest.resetModules();
    delete process.env.DROPBOX_ACCESS_TOKEN;
    delete process.env.DROPBOX_REFRESH_TOKEN;
    delete process.env.DROPBOX_APP_KEY;
    delete process.env.DROPBOX_APP_SECRET;
  });

  it('returns static token when DROPBOX_ACCESS_TOKEN is set', async () => {
    const axios = require('axios');
    process.env.DROPBOX_ACCESS_TOKEN = 'static-token-123';
    const { fetchAccessToken, getDropboxClient } = require('../services/dropboxClient');
    const t = await fetchAccessToken();
    expect(t).toBe('static-token-123');

    const client = await getDropboxClient();
    expect(client.accessToken).toBe('static-token-123');
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('throws when no static token and missing envs for refresh', async () => {
    const axios = require('axios');
    const { fetchAccessToken } = require('../services/dropboxClient');
    await expect(fetchAccessToken()).rejects.toThrow('Variables de entorno críticas faltantes');
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('refreshes token using axios and returns new token', async () => {
    const axios = require('axios');
    process.env.DROPBOX_REFRESH_TOKEN = 'refresh';
    process.env.DROPBOX_APP_KEY = 'key';
    process.env.DROPBOX_APP_SECRET = 'secret';
    axios.post.mockResolvedValue({ data: { access_token: 'new-token', expires_in: 3600 } });
    const { fetchAccessToken } = require('../services/dropboxClient');
    const t = await fetchAccessToken();
    expect(t).toBe('new-token');
    expect(axios.post).toHaveBeenCalled();
  });
});
