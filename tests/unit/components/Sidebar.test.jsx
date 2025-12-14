import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Sidebar from '@/components/Sidebar';
import axios from 'axios';

vi.mock('axios');

describe('Sidebar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with sidebar open by default', () => {
    render(<Sidebar />);
    expect(screen.getByText('My Projects')).toBeInTheDocument();
    expect(screen.getByText('Friends')).toBeInTheDocument();
  });

  it('should toggle sidebar on button click', () => {
    const { container } = render(<Sidebar />);
    const sidebar = container.querySelector('.sidebar');
    const toggleButton = container.querySelector('.sidebar-toggle');
    
    expect(sidebar).toHaveClass('open');
    
    fireEvent.click(toggleButton);
    expect(sidebar).toHaveClass('closed');
    
    fireEvent.click(toggleButton);
    expect(sidebar).toHaveClass('open');
  });

  it('should expand and fetch projects when clicked', async () => {
    const mockProjects = [
      { id: 1, name: 'Project 1', description: 'Description 1' },
      { id: 2, name: 'Project 2', description: 'Description 2' },
    ];

    axios.post.mockResolvedValueOnce({
      data: {
        data: {
          project: {
            myprojects: mockProjects,
          },
        },
      },
    });

    render(<Sidebar />);
    
    const projectsItem = screen.getByText('My Projects').closest('li');
    fireEvent.click(projectsItem);

    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument();
      expect(screen.getByText('Project 2')).toBeInTheDocument();
    });
  });

  it('should show loading state when fetching projects', async () => {
    axios.post.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<Sidebar />);
    
    const projectsItem = screen.getByText('My Projects').closest('li');
    fireEvent.click(projectsItem);

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  it('should show "No projects yet" when projects array is empty', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        data: {
          project: {
            myprojects: [],
          },
        },
      },
    });

    render(<Sidebar />);
    
    const projectsItem = screen.getByText('My Projects').closest('li');
    fireEvent.click(projectsItem);

    await waitFor(() => {
      expect(screen.getByText('No projects yet')).toBeInTheDocument();
    });
  });

  it('should handle error when fetching projects', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    axios.post.mockRejectedValueOnce(new Error('Network error'));

    render(<Sidebar />);
    
    const projectsItem = screen.getByText('My Projects').closest('li');
    fireEvent.click(projectsItem);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch projects:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('should expand and fetch friends when clicked', async () => {
    const mockFriends = [
      { id: 1, nickname: 'Friend1', name: 'John' },
      { id: 2, nickname: 'Friend2', name: 'Jane' },
    ];

    axios.post.mockResolvedValueOnce({
      data: {
        data: {
          friendship: {
            myfriends: mockFriends,
          },
        },
      },
    });

    render(<Sidebar />);
    
    const friendsItem = screen.getByText('Friends').closest('li');
    fireEvent.click(friendsItem);

    await waitFor(() => {
      expect(screen.getByText('Friend1')).toBeInTheDocument();
      expect(screen.getByText('Friend2')).toBeInTheDocument();
    });
  });

  it('should show loading state when fetching friends', async () => {
    axios.post.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<Sidebar />);
    
    const friendsItem = screen.getByText('Friends').closest('li');
    fireEvent.click(friendsItem);

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  it('should show "No friends yet" when friends array is empty', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        data: {
          friendship: {
            myfriends: [],
          },
        },
      },
    });

    render(<Sidebar />);
    
    const friendsItem = screen.getByText('Friends').closest('li');
    fireEvent.click(friendsItem);

    await waitFor(() => {
      expect(screen.getByText('No friends yet')).toBeInTheDocument();
    });
  });

  it('should handle error when fetching friends', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    axios.post.mockRejectedValueOnce(new Error('Network error'));

    render(<Sidebar />);
    
    const friendsItem = screen.getByText('Friends').closest('li');
    fireEvent.click(friendsItem);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch friends:',
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('should not fetch projects again if already loaded', async () => {
    const mockProjects = [
      { id: 1, name: 'Project 1', description: 'Description 1' },
    ];

    axios.post.mockResolvedValueOnce({
      data: {
        data: {
          project: {
            myprojects: mockProjects,
          },
        },
      },
    });

    render(<Sidebar />);
    
    const projectsItem = screen.getByText('My Projects').closest('li');
    
    // First click - should fetch
    fireEvent.click(projectsItem);
    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument();
    });

    // Close
    fireEvent.click(projectsItem);
    
    // Open again - should not fetch
    fireEvent.click(projectsItem);
    
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it('should collapse projects when clicked again', async () => {
    const mockProjects = [
      { id: 1, name: 'Project 1', description: 'Description 1' },
    ];

    axios.post.mockResolvedValueOnce({
      data: {
        data: {
          project: {
            myprojects: mockProjects,
          },
        },
      },
    });

    render(<Sidebar />);
    
    const projectsItem = screen.getByText('My Projects').closest('li');
    
    // Expand
    fireEvent.click(projectsItem);
    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument();
    });

    // Collapse
    fireEvent.click(projectsItem);
    await waitFor(() => {
      expect(screen.queryByText('Project 1')).not.toBeInTheDocument();
    });
  });

  it('should handle GraphQL errors for projects', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    axios.post.mockResolvedValueOnce({
      data: {
        errors: [{ message: 'GraphQL Error' }],
      },
    });

    render(<Sidebar />);
    
    const projectsItem = screen.getByText('My Projects').closest('li');
    fireEvent.click(projectsItem);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should handle GraphQL errors for friends', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    axios.post.mockResolvedValueOnce({
      data: {
        errors: [{ message: 'GraphQL Error' }],
      },
    });

    render(<Sidebar />);
    
    const friendsItem = screen.getByText('Friends').closest('li');
    fireEvent.click(friendsItem);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });
});
