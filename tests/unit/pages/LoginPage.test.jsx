import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
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

const renderWithRouter = (component) => {
  return render(
    <AuthProvider>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </AuthProvider>
  );
};

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render login form', () => {
    renderWithRouter(<LoginPage />);
    
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('should render Sign In button', () => {
    renderWithRouter(<LoginPage />);
    
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    expect(signInButton).toBeInTheDocument();
  });

  it('should render Register button', () => {
    renderWithRouter(<LoginPage />);
    
    const registerButton = screen.getByRole('button', { name: /register/i });
    expect(registerButton).toBeInTheDocument();
  });

  it('should update email input on change', () => {
    renderWithRouter(<LoginPage />);
    
    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    expect(emailInput.value).toBe('test@example.com');
  });

  it('should update password input on change', () => {
    renderWithRouter(<LoginPage />);
    
    const passwordInput = screen.getByPlaceholderText('Password');
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(passwordInput.value).toBe('password123');
  });

  it('should have correct input types', () => {
    renderWithRouter(<LoginPage />);
    
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should handle successful login with GraphQL', async () => {
    const mockToken = 'mock-jwt-token';
    axios.post.mockResolvedValueOnce({
      data: {
        data: {
          auth: {
            loginUser: {
              token: mockToken,
            },
          },
        },
      },
    });

    renderWithRouter(<LoginPage />);
    
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signInButton);
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:5000/api',
        expect.objectContaining({
          query: expect.stringContaining('LoginUser'),
          variables: {
            input: {
              email: 'test@example.com',
              password: 'password123',
            },
          },
        })
      );
    });
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('should display error on login failure', async () => {
    axios.post.mockRejectedValueOnce(new Error('Login failed'));

    renderWithRouter(<LoginPage />);
    
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(signInButton);
    
    await waitFor(() => {
      expect(screen.getByText('Login failed')).toBeInTheDocument();
    });
  });

  it('should render error message with correct CSS class', async () => {
    axios.post.mockRejectedValueOnce(new Error('Login failed'));

    renderWithRouter(<LoginPage />);
    
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInButton);
    
    await waitFor(() => {
      const errorElement = screen.getByText('Login failed');
      expect(errorElement).toHaveClass('login-error');
    });
  });

  it('should navigate to register page when Register button is clicked', () => {
    renderWithRouter(<LoginPage />);
    
    const registerButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  it('should render Google login button', () => {
    renderWithRouter(<LoginPage />);
    
    const googleButton = screen.getByAltText('Google');
    expect(googleButton).toBeInTheDocument();
  });

  it('should render Facebook login button', () => {
    renderWithRouter(<LoginPage />);
    
    const facebookButton = screen.getByAltText('Facebook');
    expect(facebookButton).toBeInTheDocument();
  });

  it('should show error when Google login is clicked', () => {
    renderWithRouter(<LoginPage />);
    
    const googleButton = screen.getByAltText('Google').closest('button');
    fireEvent.click(googleButton);
    
    expect(screen.getByText('Google login not implemented yet!')).toBeInTheDocument();
  });

  it('should show error when Facebook login is clicked', () => {
    renderWithRouter(<LoginPage />);
    
    const facebookButton = screen.getByAltText('Facebook').closest('button');
    fireEvent.click(facebookButton);
    
    expect(screen.getByText('Facebook login not implemented yet!')).toBeInTheDocument();
  });

  it('should render welcome text', () => {
    renderWithRouter(<LoginPage />);
    
    expect(screen.getByText('Welcome to the App')).toBeInTheDocument();
  });

  it('should render description text', () => {
    renderWithRouter(<LoginPage />);
    
    expect(screen.getByText(/Lorem ipsum dolor sit amet/i)).toBeInTheDocument();
  });

  it('should render social login circles', () => {
    const { container } = renderWithRouter(<LoginPage />);
    
    const socialContainer = container.querySelector('.social-login-circles');
    expect(socialContainer).toBeInTheDocument();
  });

  it('should store token in localStorage after successful login', async () => {
    const mockToken = 'mock-jwt-token-12345';
    axios.post.mockResolvedValueOnce({
      data: {
        data: {
          auth: {
            loginUser: {
              token: mockToken,
            },
          },
        },
      },
    });

    renderWithRouter(<LoginPage />);
    
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(signInButton);
    
    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('token', mockToken);
    });
  });

  it('should handle network error during login', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network Error'));

    renderWithRouter(<LoginPage />);
    
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInButton);
    
    await waitFor(() => {
      expect(screen.getByText('Network Error')).toBeInTheDocument();
    });
  });

  it('should prevent default form submission', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        data: {
          auth: {
            loginUser: {
              token: 'mock-token',
            },
          },
        },
      },
    });

    renderWithRouter(<LoginPage />);
    
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInButton);
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });
  });

  it('should not display error initially', () => {
    renderWithRouter(<LoginPage />);
    
    expect(screen.queryByText('Login failed')).not.toBeInTheDocument();
    expect(screen.queryByText('Google login not implemented yet!')).not.toBeInTheDocument();
  });

  it('should handle empty form submission', async () => {
    axios.post.mockRejectedValueOnce(new Error('Validation error'));

    renderWithRouter(<LoginPage />);
    
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInButton);
    
    await waitFor(() => {
      expect(screen.getByText('Validation error')).toBeInTheDocument();
    });
  });

  it('should render both login buttons with correct classes', () => {
    renderWithRouter(<LoginPage />);
    
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    const registerButton = screen.getByRole('button', { name: /register/i });
    
    expect(signInButton).toHaveClass('pill-btn', 'login');
    expect(registerButton).toHaveClass('pill-btn', 'register');
  });

  it('should have correct button types', () => {
    renderWithRouter(<LoginPage />);
    
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    const registerButton = screen.getByRole('button', { name: /register/i });
    
    expect(signInButton).toHaveAttribute('type', 'submit');
    expect(registerButton).toHaveAttribute('type', 'button');
  });
});
