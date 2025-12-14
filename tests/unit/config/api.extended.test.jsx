import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { API_CONFIG, getAuthHeaders } from '@/config/api';

describe('API_CONFIG Extended Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('API_CONFIG object', () => {
    it('should have GRAPHQL_ENDPOINT property', () => {
      expect(API_CONFIG).toHaveProperty('GRAPHQL_ENDPOINT');
    });

    it('should have WS_ENDPOINT property', () => {
      expect(API_CONFIG).toHaveProperty('WS_ENDPOINT');
    });

    it('should use default GRAPHQL_ENDPOINT when env var is not set', () => {
      expect(API_CONFIG.GRAPHQL_ENDPOINT).toBe('http://localhost:5000/api');
    });

    it('should use default WS_ENDPOINT when env var is not set', () => {
      expect(API_CONFIG.WS_ENDPOINT).toBe('ws://localhost:5000/graphql');
    });

    it('should have valid URL format for GRAPHQL_ENDPOINT', () => {
      expect(() => new URL(API_CONFIG.GRAPHQL_ENDPOINT)).not.toThrow();
    });

    it('should use http protocol for GRAPHQL_ENDPOINT', () => {
      const url = new URL(API_CONFIG.GRAPHQL_ENDPOINT);
      expect(url.protocol).toBe('http:');
    });

    it('should use ws protocol for WS_ENDPOINT', () => {
      expect(API_CONFIG.WS_ENDPOINT).toMatch(/^ws:/);
    });
  });

  describe('getAuthHeaders function', () => {
    it('should return headers with Content-Type', () => {
      const headers = getAuthHeaders();
      expect(headers).toHaveProperty('Content-Type');
      expect(headers['Content-Type']).toBe('application/json');
    });

    it('should not include Authorization header when no token exists', () => {
      const headers = getAuthHeaders();
      expect(headers).not.toHaveProperty('Authorization');
    });

    it('should include Authorization header when token exists', () => {
      localStorage.setItem('token', 'test-token-123');
      const headers = getAuthHeaders();
      expect(headers).toHaveProperty('Authorization');
      expect(headers.Authorization).toBe('Bearer test-token-123');
    });

    it('should format Authorization header with Bearer prefix', () => {
      localStorage.setItem('token', 'my-jwt-token');
      const headers = getAuthHeaders();
      expect(headers.Authorization).toMatch(/^Bearer /);
    });

    it('should handle empty string token', () => {
      localStorage.setItem('token', '');
      const headers = getAuthHeaders();
      expect(headers).not.toHaveProperty('Authorization');
    });

    it('should handle different token formats', () => {
      const tokens = [
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        'simple-token',
        '12345',
        'token-with-dashes-and_underscores'
      ];

      tokens.forEach(token => {
        localStorage.setItem('token', token);
        const headers = getAuthHeaders();
        expect(headers.Authorization).toBe(`Bearer ${token}`);
      });
    });

    it('should return new object each time', () => {
      const headers1 = getAuthHeaders();
      const headers2 = getAuthHeaders();
      expect(headers1).not.toBe(headers2);
    });

    it('should not mutate returned headers object when token changes', () => {
      localStorage.setItem('token', 'token1');
      const headers1 = getAuthHeaders();
      
      localStorage.setItem('token', 'token2');
      const headers2 = getAuthHeaders();
      
      expect(headers1.Authorization).toBe('Bearer token1');
      expect(headers2.Authorization).toBe('Bearer token2');
    });

    it('should handle localStorage.getItem returning null', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
      const headers = getAuthHeaders();
      expect(headers).not.toHaveProperty('Authorization');
    });

    it('should handle multiple calls with same token', () => {
      localStorage.setItem('token', 'consistent-token');
      const headers1 = getAuthHeaders();
      const headers2 = getAuthHeaders();
      const headers3 = getAuthHeaders();
      
      expect(headers1.Authorization).toBe('Bearer consistent-token');
      expect(headers2.Authorization).toBe('Bearer consistent-token');
      expect(headers3.Authorization).toBe('Bearer consistent-token');
    });
  });

  describe('Integration scenarios', () => {
    it('should work with fetch API', async () => {
      const headers = getAuthHeaders();
      expect(() => {
        new Request(API_CONFIG.GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers
        });
      }).not.toThrow();
    });

    it('should provide complete headers for GraphQL request', () => {
      localStorage.setItem('token', 'auth-token');
      const headers = getAuthHeaders();
      
      expect(headers['Content-Type']).toBe('application/json');
      expect(headers.Authorization).toBe('Bearer auth-token');
    });

    it('should handle authentication flow', () => {
      // No token initially
      let headers = getAuthHeaders();
      expect(headers).not.toHaveProperty('Authorization');
      
      // After login
      localStorage.setItem('token', 'new-session-token');
      headers = getAuthHeaders();
      expect(headers.Authorization).toBe('Bearer new-session-token');
      
      // After logout
      localStorage.removeItem('token');
      headers = getAuthHeaders();
      expect(headers).not.toHaveProperty('Authorization');
    });
  });
});
