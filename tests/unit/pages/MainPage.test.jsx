import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MainPage from '@/pages/MainPage';
import { AuthProvider } from '@/context/AuthContext';
import axios from 'axios';

vi.mock('axios');

const renderWithRouter = (component) => {
  return render(
    <AuthProvider>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </AuthProvider>
  );
};

describe('MainPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('token', 'mock-token');
  });

  it('should render main page structure', async () => {
    axios.post.mockResolvedValue({
      data: {
        data: {
          project: {
            trendingprojects: {
              nodes: [],
            },
          },
        },
      },
    });

    renderWithRouter(<MainPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Trending Projects')).toBeInTheDocument();
    });
  });

  it('should fetch trending projects on mount', async () => {
    const mockProjects = [
      {
        id: 1,
        name: 'Trending Project 1',
        description: 'Description 1',
        imageUrl: 'https://example.com/image1.jpg',
        viewCount: 100,
        likeCount: 50,
        owner: { id: 1, nickname: 'owner1', name: 'Owner' },
      },
    ];

    axios.post.mockResolvedValue({
      data: {
        data: {
          project: {
            trendingprojects: {
              nodes: mockProjects,
            },
          },
        },
      },
    });

    renderWithRouter(<MainPage />);
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          query: expect.stringContaining('trendingprojects'),
          variables: { first: 5 },
        }),
        expect.objectContaining({
          headers: expect.any(Object),
        })
      );
    });
  });

  it('should display loading state initially', () => {
    axios.post.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithRouter(<MainPage />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display trending projects after loading', async () => {
    const mockProjects = [
      {
        id: 1,
        name: 'Trending Project 1',
        description: 'Description 1',
        imageUrl: 'https://example.com/image1.jpg',
        viewCount: 100,
        likeCount: 50,
        owner: { id: 1, nickname: 'owner1', name: 'Owner' },
      },
      {
        id: 2,
        name: 'Trending Project 2',
        description: 'Description 2',
        imageUrl: null,
        viewCount: 200,
        likeCount: 100,
        owner: { id: 2, nickname: 'owner2', name: 'Another Owner' },
      },
    ];

    axios.post.mockResolvedValue({
      data: {
        data: {
          project: {
            trendingprojects: {
              nodes: mockProjects,
            },
          },
        },
      },
    });

    renderWithRouter(<MainPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Trending Project 1')).toBeInTheDocument();
      expect(screen.getByText('Trending Project 2')).toBeInTheDocument();
    });
  });

  it('should handle empty trending projects', async () => {
    axios.post.mockResolvedValue({
      data: {
        data: {
          project: {
            trendingprojects: {
              nodes: [],
            },
          },
        },
      },
    });

    renderWithRouter(<MainPage />);
    
    await waitFor(() => {
      expect(screen.getByText('No trending projects at the moment.')).toBeInTheDocument();
    });
  });

  it('should handle fetch error gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    axios.post.mockRejectedValue(new Error('Network error'));

    renderWithRouter(<MainPage />);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch trending projects:',
        expect.any(Error)
      );
    });

    await waitFor(() => {
      expect(screen.getByText('No trending projects at the moment.')).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should handle GraphQL errors', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    axios.post.mockResolvedValue({
      data: {
        errors: [{ message: 'GraphQL Error' }],
      },
    });

    renderWithRouter(<MainPage />);
    
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should use fallback image when imageUrl is null', async () => {
    const mockProjects = [
      {
        id: 3,
        name: 'Project Without Image',
        description: 'No image',
        imageUrl: null,
        viewCount: 50,
        likeCount: 25,
        owner: { id: 3, nickname: 'owner3', name: 'Owner Three' },
      },
    ];

    axios.post.mockResolvedValue({
      data: {
        data: {
          project: {
            trendingprojects: {
              nodes: mockProjects,
            },
          },
        },
      },
    });

    renderWithRouter(<MainPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Project Without Image')).toBeInTheDocument();
    });

    // Check that fallback image URL is generated
    const image = screen.getByAltText('Project Without Image');
    expect(image).toHaveAttribute('src', expect.stringContaining('picsum.photos'));
  });

  it('should render Navbar, Sidebar, Feed, and Trending components', async () => {
    axios.post.mockResolvedValue({
      data: {
        data: {
          project: {
            trendingprojects: {
              nodes: [],
            },
          },
        },
      },
    });

    const { container } = renderWithRouter(<MainPage />);
    
    await waitFor(() => {
      expect(container.querySelector('.navbar')).toBeInTheDocument();
      expect(container.querySelector('.sidebar')).toBeInTheDocument();
      expect(container.querySelector('.main-content')).toBeInTheDocument();
      expect(container.querySelector('.trending-bar')).toBeInTheDocument();
    });
  });

  it('should map project data correctly', async () => {
    const mockProjects = [
      {
        id: 1,
        name: 'Test Project',
        description: 'Test Description',
        imageUrl: 'https://test.com/image.jpg',
        viewCount: 150,
        likeCount: 75,
        owner: { id: 1, nickname: 'testowner', name: 'Test Owner' },
      },
    ];

    axios.post.mockResolvedValue({
      data: {
        data: {
          project: {
            trendingprojects: {
              nodes: mockProjects,
            },
          },
        },
      },
    });

    renderWithRouter(<MainPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });
  });

  it('should set loading to false after successful fetch', async () => {
    axios.post.mockResolvedValue({
      data: {
        data: {
          project: {
            trendingprojects: {
              nodes: [],
            },
          },
        },
      },
    });

    renderWithRouter(<MainPage />);
    
    // Initially loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // After fetch completes
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  it('should set loading to false after failed fetch', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    axios.post.mockRejectedValue(new Error('Network error'));

    renderWithRouter(<MainPage />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore();
  });
});
