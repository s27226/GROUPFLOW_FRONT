import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Post from '@/components/Post';

describe('Post Component', () => {
  const mockPostData = {
    author: 'testuser',
    time: '2h ago',
    content: 'This is test content for the post',
    image: null
  };

  it('should render post component', () => {
    const { container } = render(<Post {...mockPostData} />);
    expect(container.querySelector('.post-card')).toBeInTheDocument();
  });

  it('should display author name', () => {
    render(<Post {...mockPostData} />);
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('should display post content', () => {
    render(<Post {...mockPostData} />);
    expect(screen.getByText('This is test content for the post')).toBeInTheDocument();
  });

  it('should display time', () => {
    render(<Post {...mockPostData} />);
    expect(screen.getByText('2h ago')).toBeInTheDocument();
  });

  it('should render without image when not provided', () => {
    render(<Post {...mockPostData} />);
    const postImage = document.querySelector('.post-image');
    expect(postImage).not.toBeInTheDocument();
  });

  it('should render with image when provided', () => {
    const postWithImage = { ...mockPostData, image: 'https://example.com/image.jpg' };
    render(<Post {...postWithImage} />);
    const postImage = document.querySelector('.post-image');
    expect(postImage).toBeInTheDocument();
  });

  it('should render action buttons', () => {
    render(<Post {...mockPostData} />);
    expect(screen.getByRole('button', { name: /like/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /comment/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
  });

  it('should render post header with avatar', () => {
    render(<Post {...mockPostData} />);
    const avatar = document.querySelector('.post-avatar');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('alt', 'testuser');
  });
});
