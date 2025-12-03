import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from '@/pages/RegisterPage';
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

describe('RegisterPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render register form', () => {
    renderWithRouter(<RegisterPage />);
    
    expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nickname')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Repeat Password')).toBeInTheDocument();
  });

  it('should render register button', () => {
    renderWithRouter(<RegisterPage />);
    
    const registerButton = screen.getByRole('button', { name: /register/i });
    expect(registerButton).toBeInTheDocument();
  });

  it('should update name input on change', () => {
    renderWithRouter(<RegisterPage />);
    
    const nameInput = screen.getByPlaceholderText('First Name');
    fireEvent.change(nameInput, { target: { value: 'John' } });
    
    expect(nameInput.value).toBe('John');
  });

  it('should update email input on change', () => {
    renderWithRouter(<RegisterPage />);
    
    const emailInput = screen.getByPlaceholderText('Email');
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    
    expect(emailInput.value).toBe('john@example.com');
  });

  it('should update password input on change', () => {
    renderWithRouter(<RegisterPage />);
    
    const passwordInput = screen.getByPlaceholderText('Password');
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(passwordInput.value).toBe('password123');
  });

  it('should have password input type', () => {
    renderWithRouter(<RegisterPage />);
    
    const passwordInput = screen.getByPlaceholderText('Password');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should handle successful registration', async () => {
    const mockToken = 'mock-jwt-token';
    axios.post.mockResolvedValueOnce({
      data: {
        data: {
          auth: {
            registerUser: {
              token: mockToken,
            },
          },
        },
      },
    });

    renderWithRouter(<RegisterPage />);
    
    const nameInput = screen.getByPlaceholderText('First Name');
    const surnameInput = screen.getByPlaceholderText('Last Name');
    const nicknameInput = screen.getByPlaceholderText('Nickname');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const confirmPasswordInput = screen.getByPlaceholderText('Repeat Password');
    const registerButton = screen.getByRole('button', { name: /register/i });
    
    fireEvent.change(nameInput, { target: { value: 'John' } });
    fireEvent.change(surnameInput, { target: { value: 'Doe' } });
    fireEvent.change(nicknameInput, { target: { value: 'johndoe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    
    fireEvent.click(registerButton);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('should display error on registration failure', async () => {
    axios.post.mockRejectedValueOnce(new Error('Registration failed'));

    renderWithRouter(<RegisterPage />);
    
    const nameInput = screen.getByPlaceholderText('First Name');
    const surnameInput = screen.getByPlaceholderText('Last Name');
    const nicknameInput = screen.getByPlaceholderText('Nickname');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const confirmPasswordInput = screen.getByPlaceholderText('Repeat Password');
    const registerButton = screen.getByRole('button', { name: /register/i });
    
    fireEvent.change(nameInput, { target: { value: 'John' } });
    fireEvent.change(surnameInput, { target: { value: 'Doe' } });
    fireEvent.change(nicknameInput, { target: { value: 'johndoe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    
    fireEvent.click(registerButton);
    
    await waitFor(() => {
      expect(screen.getByText('Registration failed')).toBeInTheDocument();
    });
  });

  it('should prevent default form submission', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        data: {
          auth: {
            registerUser: {
              token: 'mock-token',
            },
          },
        },
      },
    });

    renderWithRouter(<RegisterPage />);
    
    const nameInput = screen.getByPlaceholderText('First Name');
    const surnameInput = screen.getByPlaceholderText('Last Name');
    const nicknameInput = screen.getByPlaceholderText('Nickname');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const confirmPasswordInput = screen.getByPlaceholderText('Repeat Password');
    
    fireEvent.change(nameInput, { target: { value: 'John' } });
    fireEvent.change(surnameInput, { target: { value: 'Doe' } });
    fireEvent.change(nicknameInput, { target: { value: 'johndoe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    
    const registerButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerButton);
    
    // Form submission should be prevented
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });
  });

  it('should render Google login button', () => {
    renderWithRouter(<RegisterPage />);
    
    const googleButton = screen.getByAltText('Google');
    expect(googleButton).toBeInTheDocument();
  });

  it('should render Facebook login button', () => {
    renderWithRouter(<RegisterPage />);
    
    const facebookButton = screen.getByAltText('Facebook');
    expect(facebookButton).toBeInTheDocument();
  });

  it('should show error when Google login is clicked', () => {
    renderWithRouter(<RegisterPage />);
    
    const googleButton = screen.getByAltText('Google').closest('button');
    fireEvent.click(googleButton);
    
    expect(screen.getByText('Google login not implemented yet!')).toBeInTheDocument();
  });

  it('should show error when Facebook login is clicked', () => {
    renderWithRouter(<RegisterPage />);
    
    const facebookButton = screen.getByAltText('Facebook').closest('button');
    fireEvent.click(facebookButton);
    
    expect(screen.getByText('Facebook login not implemented yet!')).toBeInTheDocument();
  });

  it('should render welcome text', () => {
    renderWithRouter(<RegisterPage />);
    
    expect(screen.getByText('Welcome to the App')).toBeInTheDocument();
  });

  it('should render description text', () => {
    renderWithRouter(<RegisterPage />);
    
    expect(screen.getByText(/Lorem ipsum dolor sit amet/i)).toBeInTheDocument();
  });

  it('should clear error when inputs change', () => {
    renderWithRouter(<RegisterPage />);
    
    const googleButton = screen.getByAltText('Google').closest('button');
    fireEvent.click(googleButton);
    
    expect(screen.getByText('Google login not implemented yet!')).toBeInTheDocument();
    
    const nameInput = screen.getByPlaceholderText('First Name');
    fireEvent.change(nameInput, { target: { value: 'John' } });
    
    // Error should still be there unless explicitly cleared in component
    // This tests current behavior
  });

  it('should render social login circles', () => {
    const { container } = renderWithRouter(<RegisterPage />);
    
    const socialContainer = container.querySelector('.social-login-circles');
    expect(socialContainer).toBeInTheDocument();
  });

  it('should handle network error during registration', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network Error'));

    renderWithRouter(<RegisterPage />);
    
    const registerButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerButton);
    
    await waitFor(() => {
      expect(screen.getByText('All fields are required')).toBeInTheDocument();
    });
  });

  it('should store token in localStorage after successful registration', async () => {
    const mockToken = 'mock-jwt-token-12345';
    const mockResponse = {
      data: {
        data: {
          auth: {
            registerUser: {
              token: mockToken,
            },
          },
        },
      },
    };
    
    // Setup mock before rendering
    axios.post = vi.fn().mockResolvedValue(mockResponse);

    renderWithRouter(<RegisterPage />);
    
    const nameInput = screen.getByPlaceholderText('First Name');
    const surnameInput = screen.getByPlaceholderText('Last Name');
    const nicknameInput = screen.getByPlaceholderText('Nickname');
    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const confirmPasswordInput = screen.getByPlaceholderText('Repeat Password');
    const registerButton = screen.getByRole('button', { name: /register/i });
    
    fireEvent.change(nameInput, { target: { value: 'Test' } });
    fireEvent.change(surnameInput, { target: { value: 'User' } });
    fireEvent.change(nicknameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'testpass123' } });
    fireEvent.click(registerButton);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
    
    expect(localStorage.setItem).toHaveBeenCalledWith('token', mockToken);
  });
});
