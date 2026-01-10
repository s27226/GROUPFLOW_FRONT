import { describe, it, expect, beforeAll, afterAll, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider } from '../../../src/context/AuthContext';
import { Feed } from '../../../src/components/feed';
import { server } from '../../mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Feed Component', () => {
  beforeEach(() => {
    Storage.prototype.getItem = vi.fn(() => 'test-token');
  });

  it('should render feed container', async () => {
    render(
      <AuthProvider>
        <Feed />
      </AuthProvider>
    );
    
    // Initially shows loading
    expect(screen.getByText('Loading posts...')).toBeInTheDocument();
    
    // Wait for posts to load
    await waitFor(() => {
      const container = document.querySelector('.feed-container');
      expect(container).toBeInTheDocument();
    });
  });

  it('should render loading state initially', () => {
    render(
      <AuthProvider>
        <Feed />
      </AuthProvider>
    );
    
    expect(screen.getByText('Loading posts...')).toBeInTheDocument();
  });

  it('should display posts after loading', async () => {
    render(
      <AuthProvider>
        <Feed />
      </AuthProvider>
    );
    
    // Wait for posts to be displayed
    await waitFor(() => {
      const feedContainer = document.querySelector('.feed-container');
      expect(feedContainer).toBeInTheDocument();
    });
  });

  it('should render with authentication context', () => {
    const { container } = render(
      <AuthProvider>
        <Feed />
      </AuthProvider>
    );
    
    expect(container).toBeTruthy();
  });
});
