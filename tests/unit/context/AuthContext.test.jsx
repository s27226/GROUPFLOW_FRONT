import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/context/AuthContext';

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should provide initial token as null when localStorage is empty', () => {
    localStorage.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it('should store token when login is called', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const testToken = 'test-jwt-token-123';

    act(() => {
      result.current.login(testToken);
    });

    expect(result.current.token).toBe(testToken);
    expect(localStorage.setItem).toHaveBeenCalledWith('token', testToken);
  });

  it('should store token and user data when login is called with userData', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const testToken = 'test-jwt-token-123';
    const testUser = {
      id: 1,
      nickname: 'testuser',
      name: 'Test',
      surname: 'User',
      email: 'test@example.com'
    };

    act(() => {
      result.current.login(testToken, testUser);
    });

    expect(result.current.token).toBe(testToken);
    expect(result.current.user).toEqual(testUser);
    expect(localStorage.setItem).toHaveBeenCalledWith('token', testToken);
  });

  it('should clear token and user when logout is called', () => {
    // Setup: Mock localStorage to return an existing token
    localStorage.getItem.mockReturnValue('existing-token');

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const testUser = {
      id: 1,
      nickname: 'testuser',
      name: 'Test',
      surname: 'User'
    };

    act(() => {
      result.current.login('token', testUser);
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
  });

  it('should load token from localStorage on initialization', () => {
    const existingToken = 'stored-token-456';
    localStorage.getItem.mockReturnValue(existingToken);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.token).toBe(existingToken);
  });

  it('should update user data when updateUser is called', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const testUser = {
      id: 1,
      nickname: 'testuser',
      name: 'Test',
      surname: 'User',
      email: 'test@example.com'
    };

    act(() => {
      result.current.updateUser(testUser);
    });

    expect(result.current.user).toEqual(testUser);
  });

  it('should update token when login is called multiple times', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const firstToken = 'first-token';
    const secondToken = 'second-token';

    act(() => {
      result.current.login(firstToken);
    });
    expect(result.current.token).toBe(firstToken);

    act(() => {
      result.current.login(secondToken);
    });
    expect(result.current.token).toBe(secondToken);
    expect(localStorage.setItem).toHaveBeenCalledTimes(2);
  });
});
