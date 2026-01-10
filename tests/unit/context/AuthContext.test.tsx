import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../../src/context/AuthContext';

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should provide initial user as null when localStorage is empty', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should store user when login is called', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const testUser = {
      id: '1',
      nickname: 'testuser',
      name: 'Test',
      surname: 'User',
      email: 'test@example.com'
    };

    act(() => {
      result.current.login(testUser);
    });

    expect(result.current.user).toEqual(testUser);
    expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(testUser));
  });

  it('should store user data when login is called with userData', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const testUser = {
      id: '1',
      nickname: 'testuser',
      name: 'Test',
      surname: 'User',
      email: 'test@example.com'
    };

    act(() => {
      result.current.login(testUser);
    });

    expect(result.current.user).toEqual(testUser);
    expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(testUser));
  });

  it('should clear user when logout is called', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const testUser = {
      id: '1',
      nickname: 'testuser',
      name: 'Test',
      surname: 'User'
    };

    act(() => {
      result.current.login(testUser);
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should load user from localStorage on initialization', () => {
    const existingUser = { id: '1', nickname: 'stored-user' };
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(JSON.stringify(existingUser));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.user).toEqual(existingUser);
  });

  it('should update user data when updateUser is called', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const testUser = {
      id: '1',
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

  it('should update user when login is called multiple times', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    const firstUser = { id: '1', nickname: 'first-user' };
    const secondUser = { id: '2', nickname: 'second-user' };

    act(() => {
      result.current.login(firstUser);
    });
    expect(result.current.user).toEqual(firstUser);

    act(() => {
      result.current.login(secondUser);
    });
    expect(result.current.user).toEqual(secondUser);
  });
});
