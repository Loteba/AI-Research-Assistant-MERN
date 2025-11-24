import authService from '../authService';
import axios from 'axios';

jest.mock('axios');

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('register', () => {
    test('registers user and saves to localStorage', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const response = {
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          token: 'token123',
        },
      };

      axios.post.mockResolvedValue(response);

      const result = await authService.register(userData);

      expect(axios.post).toHaveBeenCalledWith('/api/users/register', userData);
      expect(result).toEqual(response.data);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(response.data));
    });

    test('handles registration error', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const error = new Error('Registration failed');
      axios.post.mockRejectedValue(error);

      await expect(authService.register(userData)).rejects.toThrow('Registration failed');
    });

    test('does not save to localStorage if response is empty', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      axios.post.mockResolvedValue({ data: null });

      const result = await authService.register(userData);

      expect(result).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('login', () => {
    test('logs in user and saves to localStorage', async () => {
      const userData = {
        email: 'john@example.com',
        password: 'password123',
      };

      const response = {
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          token: 'token123',
          role: 'user',
        },
      };

      axios.post.mockResolvedValue(response);

      const result = await authService.login(userData);

      expect(axios.post).toHaveBeenCalledWith('/api/users/login', userData);
      expect(result).toEqual(response.data);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(response.data));
    });

    test('handles login error', async () => {
      const userData = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };

      const error = new Error('Invalid credentials');
      axios.post.mockRejectedValue(error);

      await expect(authService.login(userData)).rejects.toThrow('Invalid credentials');
    });

    test('does not save to localStorage if response is empty', async () => {
      const userData = {
        email: 'john@example.com',
        password: 'password123',
      };

      axios.post.mockResolvedValue({ data: null });

      const result = await authService.login(userData);

      expect(result).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('forgotPassword', () => {
    test('sends forgot password request', async () => {
      const email = 'john@example.com';
      const response = {
        data: { message: 'Reset link sent to email' },
      };

      axios.post.mockResolvedValue(response);

      const result = await authService.forgotPassword(email);

      expect(axios.post).toHaveBeenCalledWith('/api/users/forgot-password', { email });
      expect(result).toEqual(response.data);
    });

    test('handles forgot password error', async () => {
      const email = 'nonexistent@example.com';
      const error = new Error('User not found');
      axios.post.mockRejectedValue(error);

      await expect(authService.forgotPassword(email)).rejects.toThrow('User not found');
    });
  });

  describe('resetPassword', () => {
    test('resets password with token', async () => {
      const resetData = {
        email: 'john@example.com',
        token: 'reset-token-123',
        password: 'newpassword123',
      };

      const response = {
        data: { message: 'Password reset successfully' },
      };

      axios.post.mockResolvedValue(response);

      const result = await authService.resetPassword(resetData);

      expect(axios.post).toHaveBeenCalledWith('/api/users/reset-password', resetData);
      expect(result).toEqual(response.data);
    });

    test('handles reset password error', async () => {
      const resetData = {
        email: 'john@example.com',
        token: 'invalid-token',
        password: 'newpassword123',
      };

      const error = new Error('Invalid or expired token');
      axios.post.mockRejectedValue(error);

      await expect(authService.resetPassword(resetData)).rejects.toThrow(
        'Invalid or expired token'
      );
    });

    test('handles reset with all required fields', async () => {
      const resetData = {
        email: 'test@example.com',
        token: 'valid-token',
        password: 'SecurePass123!',
      };

      const response = {
        data: { success: true, message: 'Password updated' },
      };

      axios.post.mockResolvedValue(response);

      const result = await authService.resetPassword(resetData);

      expect(axios.post).toHaveBeenCalledWith('/api/users/reset-password', resetData);
      expect(result).toEqual(response.data);
    });
  });

  describe('authService exports', () => {
    test('exports all required methods', () => {
      expect(typeof authService.register).toBe('function');
      expect(typeof authService.login).toBe('function');
      expect(typeof authService.forgotPassword).toBe('function');
      expect(typeof authService.resetPassword).toBe('function');
    });
  });
});
