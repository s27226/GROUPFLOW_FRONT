import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import MainPage from '@/pages/MainPage';
import { AuthProvider } from '@/context/AuthContext';

vi.mock('axios');

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('User Profile Integration', () => {
  const mockUser = {
    id: 1,
    nickname: 'johndoe',
    name: 'John',
    surname: 'Doe',
    email: 'john.doe@example.com',
    joined: '2025-01-15T00:00:00Z',
  };

  const mockPosts = [
    {
      id: 1,
      user: {
        id: 1,
        nickname: 'johndoe',
        name: 'John',
        surname: 'Doe',
      },
      content: 'Test post content',
      title: 'Test Post',
      description: 'Test description',
      created: '2025-01-20T10:00:00Z',
      imageUrl: null,
    },
  ];

  const mockTrendingProjects = {
    nodes: [
      {
        id: 1,
        name: 'Test Project',
        description: 'A test project',
        imageUrl: null,
        viewCount: 100,
        likeCount: 50,
        created: '2025-01-10T00:00:00Z',
        owner: {
          id: 1,
          nickname: 'johndoe',
          name: 'John',
        },
      },
    ],
    totalCount: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('token', 'test-jwt-token');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should load user profile and display in navbar on main page', async () => {
    // Mock all API calls
    axios.post
      .mockResolvedValueOnce({
        // GET_CURRENT_USER
        data: {
          data: {
            users: {
              me: mockUser,
            },
          },
        },
      })
      .mockResolvedValueOnce({
        // GET_TRENDING_PROJECTS
        data: {
          data: {
            project: {
              trendingprojects: mockTrendingProjects,
            },
          },
        },
      })
      .mockResolvedValueOnce({
        // GET_POSTS
        data: {
          data: {
            post: {
              allposts: mockPosts,
            },
          },
        },
      });

    render(
      <BrowserRouter>
        <AuthProvider>
          <MainPage />
        </AuthProvider>
      </BrowserRouter>
    );

    // Wait for user profile to load in navbar
    await waitFor(
      () => {
        expect(screen.getByText('johndoe')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Verify the API was called with correct query
    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        query: expect.stringContaining('GetCurrentUser'),
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-jwt-token',
        }),
      })
    );
  });

  it('should handle unauthorized access gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    axios.post.mockRejectedValue({
      response: {
        status: 401,
        data: {
          errors: [{ message: 'Unauthorized' }],
        },
      },
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <MainPage />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    // User nickname should not be displayed
    expect(screen.queryByText('johndoe')).not.toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it('should fetch user profile only once during page load', async () => {
    axios.post
      .mockResolvedValueOnce({
        // GET_CURRENT_USER
        data: {
          data: {
            users: {
              me: mockUser,
            },
          },
        },
      })
      .mockResolvedValueOnce({
        // GET_TRENDING_PROJECTS
        data: {
          data: {
            project: {
              trendingprojects: mockTrendingProjects,
            },
          },
        },
      })
      .mockResolvedValueOnce({
        // GET_POSTS
        data: {
          data: {
            post: {
              allposts: mockPosts,
            },
          },
        },
      });

    render(
      <BrowserRouter>
        <AuthProvider>
          <MainPage />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('johndoe')).toBeInTheDocument();
    });

    // Count how many times GET_CURRENT_USER was called
    const currentUserCalls = axios.post.mock.calls.filter(
      (call) => call[1].query?.includes('GetCurrentUser')
    );
    expect(currentUserCalls.length).toBe(1);
  });

  it('should persist user data across component re-renders', async () => {
    axios.post
      .mockResolvedValueOnce({
        data: {
          data: {
            users: {
              me: mockUser,
            },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            project: {
              trendingprojects: mockTrendingProjects,
            },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            post: {
              allposts: mockPosts,
            },
          },
        },
      });

    const { rerender } = render(
      <BrowserRouter>
        <AuthProvider>
          <MainPage />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('johndoe')).toBeInTheDocument();
    });

    const initialCallCount = axios.post.mock.calls.length;

    // Rerender
    rerender(
      <BrowserRouter>
        <AuthProvider>
          <MainPage />
        </AuthProvider>
      </BrowserRouter>
    );

    // Should still display user
    expect(screen.getByText('johndoe')).toBeInTheDocument();

    // Should not make additional API calls for user data
    const currentUserCallsAfter = axios.post.mock.calls.filter(
      (call) => call[1].query?.includes('GetCurrentUser')
    );
    expect(currentUserCallsAfter.length).toBe(1);
  });

  it('should include user authentication token in all requests', async () => {
    axios.post
      .mockResolvedValueOnce({
        data: {
          data: {
            users: {
              me: mockUser,
            },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            project: {
              trendingprojects: mockTrendingProjects,
            },
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            post: {
              allposts: mockPosts,
            },
          },
        },
      });

    render(
      <BrowserRouter>
        <AuthProvider>
          <MainPage />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('johndoe')).toBeInTheDocument();
    });

    // All API calls should include the auth token
    axios.post.mock.calls.forEach((call) => {
      expect(call[2].headers.Authorization).toBe('Bearer test-jwt-token');
    });
  });
});
