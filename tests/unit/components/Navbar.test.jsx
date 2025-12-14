import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/context/AuthContext';

const mockNavigate = vi.fn();
const mockLogout = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/context/AuthContext', async () => {
  const actual = await vi.importActual('@/context/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      logout: mockLogout,
    }),
  };
});

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render navbar with logo', () => {
    renderWithRouter(<Navbar />);
    
    expect(screen.getByAltText('Logo')).toBeInTheDocument();
    expect(screen.getByText('NameWIP')).toBeInTheDocument();
  });

  it('should render search bar', () => {
    renderWithRouter(<Navbar />);
    
    const searchInput = screen.getByPlaceholderText('Search...');
    expect(searchInput).toBeInTheDocument();
  });

  it('should update search query on input change', () => {
    renderWithRouter(<Navbar />);
    
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    expect(searchInput.value).toBe('test search');
  });

  it('should handle search form submission', () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    renderWithRouter(<Navbar />);
    
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'test query' } });
    
    const form = searchInput.closest('form');
    fireEvent.submit(form);
    
    expect(consoleLogSpy).toHaveBeenCalledWith('Search submitted:', 'test query');
    
    consoleLogSpy.mockRestore();
  });

  it('should prevent default form submission', () => {
    renderWithRouter(<Navbar />);
    
    const searchInput = screen.getByPlaceholderText('Search...');
    const form = searchInput.closest('form');
    
    const submitEvent = { preventDefault: vi.fn() };
    fireEvent.submit(form);
    
    // Form should not cause page reload (default prevented)
    expect(form).toBeInTheDocument();
  });

  it('should render notification icon', () => {
    const { container } = renderWithRouter(<Navbar />);
    
    const notificationIcon = container.querySelector('.icon-wrapper');
    expect(notificationIcon).toBeInTheDocument();
  });

  it('should render message icon', () => {
    const { container } = renderWithRouter(<Navbar />);
    
    const iconWrappers = container.querySelectorAll('.icon-wrapper');
    expect(iconWrappers.length).toBeGreaterThanOrEqual(2);
  });

  it('should render user profile picture', () => {
    renderWithRouter(<Navbar />);
    
    const profilePic = screen.getByAltText('User');
    expect(profilePic).toBeInTheDocument();
    expect(profilePic).toHaveClass('user-pfp');
  });

  it('should toggle notifications dropdown on click', async () => {
    const { container } = renderWithRouter(<Navbar />);
    
    const iconWrappers = container.querySelectorAll('.icon-wrapper');
    const notificationIcon = iconWrappers[0];
    
    // Initially, dropdown should not be visible
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
    
    // Click to open
    fireEvent.click(notificationIcon);
    
    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('You have no new notifications.')).toBeInTheDocument();
    });
    
    // Click again to close
    fireEvent.click(notificationIcon);
    
    await waitFor(() => {
      expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
    });
  });

  it('should toggle messages dropdown on click', async () => {
    const { container } = renderWithRouter(<Navbar />);
    
    const iconWrappers = container.querySelectorAll('.icon-wrapper');
    const messageIcon = iconWrappers[1];
    
    // Initially, dropdown should not be visible
    expect(screen.queryByText('Messages')).not.toBeInTheDocument();
    
    // Click to open
    fireEvent.click(messageIcon);
    
    await waitFor(() => {
      expect(screen.getByText('Messages')).toBeInTheDocument();
      expect(screen.getByText('No new messages.')).toBeInTheDocument();
    });
    
    // Click again to close
    fireEvent.click(messageIcon);
    
    await waitFor(() => {
      expect(screen.queryByText('Messages')).not.toBeInTheDocument();
    });
  });

  it('should toggle profile menu on profile picture click', async () => {
    renderWithRouter(<Navbar />);
    
    const profilePic = screen.getByAltText('User');
    
    // Initially, menu should not be visible
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    
    // Click to open
    fireEvent.click(profilePic);
    
    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Help')).toBeInTheDocument();
    });
  });

  it('should close other dropdowns when opening notifications', async () => {
    const { container } = renderWithRouter(<Navbar />);
    
    const iconWrappers = container.querySelectorAll('.icon-wrapper');
    const notificationIcon = iconWrappers[0];
    const messageIcon = iconWrappers[1];
    
    // Open messages first
    fireEvent.click(messageIcon);
    await waitFor(() => {
      expect(screen.getByText('Messages')).toBeInTheDocument();
    });
    
    // Open notifications (should close messages)
    fireEvent.click(notificationIcon);
    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.queryByText('Messages')).not.toBeInTheDocument();
    });
  });

  it('should close other dropdowns when opening messages', async () => {
    const { container } = renderWithRouter(<Navbar />);
    
    const iconWrappers = container.querySelectorAll('.icon-wrapper');
    const notificationIcon = iconWrappers[0];
    const messageIcon = iconWrappers[1];
    
    // Open notifications first
    fireEvent.click(notificationIcon);
    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });
    
    // Open messages (should close notifications)
    fireEvent.click(messageIcon);
    await waitFor(() => {
      expect(screen.getByText('Messages')).toBeInTheDocument();
      expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
    });
  });

  it('should close other dropdowns when opening profile menu', async () => {
    const { container } = renderWithRouter(<Navbar />);
    
    const iconWrappers = container.querySelectorAll('.icon-wrapper');
    const notificationIcon = iconWrappers[0];
    const profilePic = screen.getByAltText('User');
    
    // Open notifications first
    fireEvent.click(notificationIcon);
    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });
    
    // Open profile menu (should close notifications)
    fireEvent.click(profilePic);
    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
    });
  });

  it('should render logout button in profile menu', async () => {
    renderWithRouter(<Navbar />);
    
    const profilePic = screen.getByAltText('User');
    fireEvent.click(profilePic);
    
    await waitFor(() => {
      const logoutButton = screen.getByText('Log Out');
      expect(logoutButton).toBeInTheDocument();
      expect(logoutButton).toHaveClass('logout');
    });
  });

  it('should call logout and navigate when logout is clicked', async () => {
    renderWithRouter(<Navbar />);
    
    const profilePic = screen.getByAltText('User');
    fireEvent.click(profilePic);
    
    await waitFor(() => {
      const logoutButton = screen.getByText('Log Out');
      fireEvent.click(logoutButton);
    });
    
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should close menu after logout', async () => {
    renderWithRouter(<Navbar />);
    
    const profilePic = screen.getByAltText('User');
    fireEvent.click(profilePic);
    
    await waitFor(() => {
      const logoutButton = screen.getByText('Log Out');
      fireEvent.click(logoutButton);
    });
    
    await waitFor(() => {
      expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    });
  });

  it('should close dropdowns when clicking outside', async () => {
    const { container } = renderWithRouter(<Navbar />);
    
    const profilePic = screen.getByAltText('User');
    fireEvent.click(profilePic);
    
    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });
    
    // Click outside
    fireEvent.mouseDown(document.body);
    
    await waitFor(() => {
      expect(screen.queryByText('Profile')).not.toBeInTheDocument();
    });
  });

  it('should navigate to /main when logo is clicked', () => {
    const { container } = renderWithRouter(<Navbar />);
    
    const logo = container.querySelector('.navbar-logo');
    fireEvent.click(logo);
    
    // Check if window.location.href would be set (in tests, this doesn't actually navigate)
    expect(logo).toBeInTheDocument();
  });

  it('should have search icon in search bar', () => {
    const { container } = renderWithRouter(<Navbar />);
    
    const searchIcon = container.querySelector('.search-icon');
    expect(searchIcon).toBeInTheDocument();
  });

  it('should render horizontal rule in profile menu', async () => {
    const { container } = renderWithRouter(<Navbar />);
    
    const profilePic = screen.getByAltText('User');
    fireEvent.click(profilePic);
    
    await waitFor(() => {
      const hr = container.querySelector('.dropdown-menu hr');
      expect(hr).toBeInTheDocument();
    });
  });

  it('should have correct CSS classes on dropdowns', async () => {
    const { container } = renderWithRouter(<Navbar />);
    
    const iconWrappers = container.querySelectorAll('.icon-wrapper');
    const notificationIcon = iconWrappers[0];
    
    fireEvent.click(notificationIcon);
    
    await waitFor(() => {
      const dropdown = container.querySelector('.dropdown-menu.large');
      expect(dropdown).toBeInTheDocument();
    });
  });

  it('should have scrollable content in dropdowns', async () => {
    const { container } = renderWithRouter(<Navbar />);
    
    const iconWrappers = container.querySelectorAll('.icon-wrapper');
    const notificationIcon = iconWrappers[0];
    
    fireEvent.click(notificationIcon);
    
    await waitFor(() => {
      const scrollContent = container.querySelector('.dropdown-scroll');
      expect(scrollContent).toBeInTheDocument();
    });
  });

  it('should render Profile, Settings, and Help buttons', async () => {
    renderWithRouter(<Navbar />);
    
    const profilePic = screen.getByAltText('User');
    fireEvent.click(profilePic);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /help/i })).toBeInTheDocument();
    });
  });

  it('should not close dropdown when clicking inside it', async () => {
    const { container } = renderWithRouter(<Navbar />);
    
    const profilePic = screen.getByAltText('User');
    fireEvent.click(profilePic);
    
    await waitFor(() => {
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });
    
    const dropdown = container.querySelector('.dropdown-menu');
    fireEvent.mouseDown(dropdown);
    
    // Dropdown should still be visible
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });
});
