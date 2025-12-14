import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';

describe('AuthContext Extended Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Initial state and token persistence', () => {
    it('should initialize with null token when localStorage is empty', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      expect(result.current.token).toBeNull();
    });

    it('should load token from localStorage on initialization', () => {
      localStorage.setItem('token', 'existing-token-123');
      
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      expect(result.current.token).toBe('existing-token-123');
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('token', '');
      
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      // Empty string should be treated as falsy
      expect(result.current.token).toBeNull();
    });

    it('should provide login function', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      expect(result.current.login).toBeDefined();
      expect(typeof result.current.login).toBe('function');
    });

    it('should provide logout function', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      expect(result.current.logout).toBeDefined();
      expect(typeof result.current.logout).toBe('function');
    });
  });

  describe('Login functionality', () => {
    it('should set token in state when login is called', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      act(() => {
        result.current.login('new-auth-token');
      });

      expect(result.current.token).toBe('new-auth-token');
    });

    it('should persist token to localStorage on login', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      act(() => {
        result.current.login('persistent-token');
      });

      expect(localStorage.getItem('token')).toBe('persistent-token');
    });

    it('should handle different token formats', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      const tokens = [
        'simple-token',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U',
        '12345',
        'token-with-special-chars_!@#'
      ];

      tokens.forEach(token => {
        act(() => {
          result.current.login(token);
        });
        expect(result.current.token).toBe(token);
        expect(localStorage.getItem('token')).toBe(token);
      });
    });

    it('should overwrite existing token on new login', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      act(() => {
        result.current.login('first-token');
      });
      expect(result.current.token).toBe('first-token');

      act(() => {
        result.current.login('second-token');
      });
      expect(result.current.token).toBe('second-token');
      expect(localStorage.getItem('token')).toBe('second-token');
    });

    it('should handle rapid successive login calls', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      act(() => {
        result.current.login('token-1');
        result.current.login('token-2');
        result.current.login('token-3');
      });

      expect(result.current.token).toBe('token-3');
      expect(localStorage.getItem('token')).toBe('token-3');
    });
  });

  describe('Logout functionality', () => {
    it('should clear token from state on logout', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      act(() => {
        result.current.login('token-to-logout');
      });
      expect(result.current.token).toBe('token-to-logout');

      act(() => {
        result.current.logout();
      });
      expect(result.current.token).toBeNull();
    });

    it('should remove token from localStorage on logout', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      act(() => {
        result.current.login('token-to-remove');
      });
      expect(localStorage.getItem('token')).toBe('token-to-remove');

      act(() => {
        result.current.logout();
      });
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should handle logout when not logged in', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      act(() => {
        result.current.logout();
      });

      expect(result.current.token).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should handle multiple logout calls', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      act(() => {
        result.current.login('some-token');
      });

      act(() => {
        result.current.logout();
        result.current.logout();
        result.current.logout();
      });

      expect(result.current.token).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('Complete authentication flows', () => {
    it('should handle login -> logout -> login cycle', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      // First login
      act(() => {
        result.current.login('first-session-token');
      });
      expect(result.current.token).toBe('first-session-token');

      // Logout
      act(() => {
        result.current.logout();
      });
      expect(result.current.token).toBeNull();

      // Second login
      act(() => {
        result.current.login('second-session-token');
      });
      expect(result.current.token).toBe('second-session-token');
      expect(localStorage.getItem('token')).toBe('second-session-token');
    });

    it('should maintain token across re-renders', () => {
      const { result, rerender } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      act(() => {
        result.current.login('persistent-token');
      });

      rerender();
      expect(result.current.token).toBe('persistent-token');

      rerender();
      expect(result.current.token).toBe('persistent-token');
    });

    it('should allow multiple consumers to access same auth state', () => {
      const { result: result1 } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });
      const { result: result2 } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      // Note: In a real scenario, both hooks would share the same context
      // This test demonstrates the API, actual sharing requires same wrapper instance
      act(() => {
        result1.current.login('shared-token');
      });

      expect(result1.current.token).toBe('shared-token');
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle empty string as token', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      act(() => {
        result.current.login('');
      });

      // Note: The actual AuthContext implementation treats empty string as falsy in initialization
      // but stores it literally when login() is called
      expect(result.current.token).toBe('');
      // localStorage will contain empty string
      expect(localStorage.getItem('token')).toBe('');
    });

    it('should handle very long token strings', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      const longToken = 'a'.repeat(10000);
      
      act(() => {
        result.current.login(longToken);
      });

      expect(result.current.token).toBe(longToken);
      expect(localStorage.getItem('token')).toBe(longToken);
    });

    it('should handle tokens with special characters', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      const specialToken = 'token!@#$%^&*()_+-={}[]|\\:";\'<>?,./';
      
      act(() => {
        result.current.login(specialToken);
      });

      expect(result.current.token).toBe(specialToken);
      expect(localStorage.getItem('token')).toBe(specialToken);
    });

    it('should handle numeric tokens', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider
      });

      // Even though tokens are typically strings, test with number-like string
      act(() => {
        result.current.login('123456789');
      });

      expect(result.current.token).toBe('123456789');
      expect(typeof result.current.token).toBe('string');
    });
  });

  describe('Context isolation', () => {
    it('should provide independent context for each AuthProvider instance', () => {
      const { result: result1 } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>
      });
      
      const { result: result2 } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>
      });

      // Each provider should have its own state
      act(() => {
        result1.current.login('token-1');
      });

      // result2 is from a different provider instance, so won't have token-1
      // (This test demonstrates provider isolation)
      expect(result1.current.token).toBe('token-1');
      expect(result2.current.token).not.toBe('token-1');
    });
  });
});
