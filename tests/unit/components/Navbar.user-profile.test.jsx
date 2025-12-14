import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/context/AuthContext';
import axios from 'axios';

vi.mock('axios');

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderNavbarWithAuth = (authContextValue = {}) => {
  const defaultValue = {
    token: 'test-token',
    user: null,
    logout: vi.fn(),
    updateUser: vi.fn(),
    ...authContextValue,
  };

  return render(
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Navbar Component - User Profile', () => {
  const mockUser = {
    id: 1,
    nickname: 'testuser',
    name: 'Test',
    surname: 'User',
    email: 'test@example.com',
    joined: '2025-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch and display current user on mount', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        data: {
          users: {
            me: mockUser,
          },
        },
      },
    });

    renderNavbarWithAuth();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          query: expect.stringContaining('GetCurrentUser'),
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });
  });

  it('should display user nickname in navbar', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        data: {
          users: {
            me: mockUser,
          },
        },
      },
    });

    renderNavbarWithAuth();

    await waitFor(() => {
      const nickname = screen.getByText('testuser');
      expect(nickname).toBeInTheDocument();
      expect(nickname).toHaveClass('user-nickname');
    });
  });

  it('should show user details in dropdown menu', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        data: {
          users: {
            me: mockUser,
          },
        },
      },
    });

    renderNavbarWithAuth();

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    const userPfp = screen.getByAltText('User');
    fireEvent.click(userPfp);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    axios.post.mockRejectedValueOnce(new Error('Network error'));

    renderNavbarWithAuth();

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch current user:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('should handle GraphQL errors', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    axios.post.mockResolvedValueOnce({
      data: {
        errors: [{ message: 'Unauthorized' }],
      },
    });

    renderNavbarWithAuth();

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch user:',
        'Unauthorized'
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('should not fetch user if already loaded', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        data: {
          users: {
            me: mockUser,
          },
        },
      },
    });

    const { rerender } = renderNavbarWithAuth();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledTimes(1);
    });

    // Rerender - should not fetch again
    rerender(
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
        </AuthProvider>
      </BrowserRouter>
    );

    // Should still be called only once
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it('should toggle dropdown menu on nickname click', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        data: {
          users: {
            me: mockUser,
          },
        },
      },
    });

    renderNavbarWithAuth();

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    const nickname = screen.getByText('testuser');
    
    // Open menu
    fireEvent.click(nickname);
    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    // Close menu
    fireEvent.click(nickname);
    await waitFor(() => {
      expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    });
  });

  it('should close dropdown when clicking outside', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        data: {
          users: {
            me: mockUser,
          },
        },
      },
    });

    const { container } = renderNavbarWithAuth();

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    const userPfp = screen.getByAltText('User');
    fireEvent.click(userPfp);

    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    // Click outside
    fireEvent.mouseDown(container);

    await waitFor(() => {
      expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    });
  });

  it('should call logout and navigate when logout button is clicked', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        data: {
          users: {
            me: mockUser,
          },
        },
      },
    });

    renderNavbarWithAuth();

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    const userPfp = screen.getByAltText('User');
    fireEvent.click(userPfp);

    await waitFor(() => {
      expect(screen.getByText('Log Out')).toBeInTheDocument();
    });

    const logoutButton = screen.getByText('Log Out');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('should render user info wrapper with correct styling', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        data: {
          users: {
            me: mockUser,
          },
        },
      },
    });

    const { container } = renderNavbarWithAuth();

    await waitFor(() => {
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    const userInfoWrapper = container.querySelector('.user-info-wrapper');
    expect(userInfoWrapper).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    axios.post.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderNavbarWithAuth();

    // User nickname should not be visible while loading
    expect(screen.queryByText('testuser')).not.toBeInTheDocument();
  });

  it('should display profile picture', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        data: {
          users: {
            me: mockUser,
          },
        },
      },
    });

    renderNavbarWithAuth();

    const userPfp = screen.getByAltText('User');
    expect(userPfp).toBeInTheDocument();
    expect(userPfp).toHaveClass('user-pfp');
  });

  it('should send correct GraphQL query structure', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        data: {
          users: {
            me: mockUser,
          },
        },
      },
    });

    renderNavbarWithAuth();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5000/api',
        expect.objectContaining({
          query: expect.stringContaining('query GetCurrentUser'),
          variables: {},
        }),
        expect.any(Object)
      );
    });
  });

  it('should include authorization header in request', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        data: {
          users: {
            me: mockUser,
          },
        },
      },
    });

    renderNavbarWithAuth();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
  });
});
