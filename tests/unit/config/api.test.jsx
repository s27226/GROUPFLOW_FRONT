import { describe, it, expect } from 'vitest';
import { API_CONFIG, getAuthHeaders } from '@/config/api';

describe('API Configuration', () => {
  it('should have GRAPHQL_ENDPOINT defined', () => {
    expect(API_CONFIG).toHaveProperty('GRAPHQL_ENDPOINT');
    expect(typeof API_CONFIG.GRAPHQL_ENDPOINT).toBe('string');
    expect(API_CONFIG.GRAPHQL_ENDPOINT).toBeTruthy();
  });

  it('should return headers with authorization when token exists', () => {
    localStorage.getItem.mockReturnValue('test-token-123');

    const headers = getAuthHeaders();

    expect(headers).toHaveProperty('Authorization');
    expect(headers.Authorization).toBe('Bearer test-token-123');
    expect(headers).toHaveProperty('Content-Type');
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('should return headers without authorization when token does not exist', () => {
    localStorage.getItem.mockReturnValue(null);

    const headers = getAuthHeaders();

    expect(headers).not.toHaveProperty('Authorization');
    expect(headers).toHaveProperty('Content-Type');
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('should always include Content-Type header', () => {
    localStorage.getItem.mockReturnValue(null);
    
    const headersWithoutToken = getAuthHeaders();
    expect(headersWithoutToken['Content-Type']).toBe('application/json');

    localStorage.getItem.mockReturnValue('some-token');
    
    const headersWithToken = getAuthHeaders();
    expect(headersWithToken['Content-Type']).toBe('application/json');
  });
});
