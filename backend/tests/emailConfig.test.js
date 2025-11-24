jest.mock('axios');
const axios = require('axios');

const { sendMail } = require('../config/email');

describe('email config sendMail with Resend provider', () => {
  afterEach(() => {
    delete process.env.RESEND_API_KEY;
    jest.clearAllMocks();
  });

  it('uses resend provider on success', async () => {
    process.env.RESEND_API_KEY = 'resend-key';
    axios.post.mockResolvedValue({ data: { id: 'res_123' }, status: 200 });

    const result = await sendMail({ to: 'a@b.com', subject: 'x', html: '<b>hi</b>' });
    expect(result.provider).toBe('resend');
    expect(result.id).toBe('res_123');
    expect(result.status).toBe(200);
    expect(axios.post).toHaveBeenCalled();
  });

  it('throws a formatted error when resend returns 403', async () => {
    process.env.RESEND_API_KEY = 'resend-key';
    const err = new Error('bad');
    err.response = { status: 403, data: { message: 'forbidden' } };
    axios.post.mockRejectedValue(err);

    await expect(sendMail({ to: 'a@b.com', subject: 'x' })).rejects.toMatchObject({ statusCode: 403 });
  });
});
