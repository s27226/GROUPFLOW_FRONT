import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import { API_CONFIG } from '@/config/api';

// Mock login component for integration testing
const MockLoginForm = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            mutation LoginUser($email: String!, $password: String!) {
              LoginUser(email: $email, password: $password) {
                userId
                token
                username
              }
            }
          `,
          variables: { email, password }
        })
      });

      const result = await response.json();
      
      if (result.data?.LoginUser) {
        localStorage.setItem('token', result.data.LoginUser.token);
      } else {
        setError('Login failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="login-form">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        data-testid="email-input"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        data-testid="password-input"
      />
      <button type="submit" disabled={loading} data-testid="submit-button">
        {loading ? 'Loading...' : 'Login'}
      </button>
      {error && <div data-testid="error-message">{error}</div>}
    </form>
  );
};

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should successfully login with valid credentials', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <MockLoginForm />
        </BrowserRouter>
      </AuthProvider>
    );

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const submitButton = screen.getByTestId('submit-button');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeTruthy();
    });
  });

  it('should show loading state during login', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <MockLoginForm />
        </BrowserRouter>
      </AuthProvider>
    );

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should handle login failure', async () => {
    server.use(
      http.post(API_CONFIG.GRAPHQL_ENDPOINT, () => {
        return HttpResponse.json({
          errors: [{ message: 'Invalid credentials' }]
        });
      })
    );

    render(
      <AuthProvider>
        <BrowserRouter>
          <MockLoginForm />
        </BrowserRouter>
      </AuthProvider>
    );

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Login failed');
    });
  });

  it('should handle network errors', async () => {
    server.use(
      http.post(API_CONFIG.GRAPHQL_ENDPOINT, () => {
        return HttpResponse.error();
      })
    );

    render(
      <AuthProvider>
        <BrowserRouter>
          <MockLoginForm />
        </BrowserRouter>
      </AuthProvider>
    );

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent('Network error');
    });
  });
});

describe('GraphQL Query Integration Tests', () => {
  it('should fetch posts successfully', async () => {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: '{ post { allposts { id title content } } }'
      })
    });

    const result = await response.json();
    expect(result.data).toHaveProperty('post');
    expect(result.data.post).toHaveProperty('allposts');
    expect(Array.isArray(result.data.post.allposts)).toBe(true);
  });

  it('should fetch trending projects successfully', async () => {
    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: '{ project { trendingprojects { nodes { id name description } totalCount } } }'
      })
    });

    const result = await response.json();
    expect(result.data).toHaveProperty('project');
    expect(result.data.project).toHaveProperty('trendingprojects');
    expect(result.data.project.trendingprojects).toHaveProperty('nodes');
    expect(Array.isArray(result.data.project.trendingprojects.nodes)).toBe(true);
  });

  it('should handle GraphQL errors in response', async () => {
    server.use(
      http.post(API_CONFIG.GRAPHQL_ENDPOINT, () => {
        return HttpResponse.json({
          errors: [{ message: 'Field not found' }]
        });
      })
    );

    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: '{ invalidField }'
      })
    });

    const result = await response.json();
    expect(result).toHaveProperty('errors');
  });
});

describe('Authorization Integration Tests', () => {
  it('should include auth token in protected requests', async () => {
    const token = 'test-auth-token';
    localStorage.setItem('token', token);

    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query: '{ me { id username } }'
      })
    });

    expect(response.ok).toBe(true);
  });

  it('should handle unauthorized access', async () => {
    server.use(
      http.post(API_CONFIG.GRAPHQL_ENDPOINT, () => {
        return HttpResponse.json(
          { errors: [{ message: 'Unauthorized' }] },
          { status: 401 }
        );
      })
    );

    const response = await fetch(API_CONFIG.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: '{ protectedData }'
      })
    });

    expect(response.status).toBe(401);
  });
});
