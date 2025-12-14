import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Trending from '@/components/Trending';

describe('Trending Component', () => {
  it('should render loading state', () => {
    render(<Trending loading={true} />);
    
    expect(screen.getByText('Trending Projects')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render empty state when no projects', () => {
    render(<Trending projects={[]} loading={false} />);
    
    expect(screen.getByText('Trending Projects')).toBeInTheDocument();
    expect(screen.getByText('No trending projects at the moment.')).toBeInTheDocument();
  });

  it('should render empty state when projects is undefined', () => {
    render(<Trending projects={undefined} loading={false} />);
    
    expect(screen.getByText('Trending Projects')).toBeInTheDocument();
    expect(screen.getByText('No trending projects at the moment.')).toBeInTheDocument();
  });

  it('should render empty state when projects is null', () => {
    render(<Trending projects={null} loading={false} />);
    
    expect(screen.getByText('Trending Projects')).toBeInTheDocument();
    expect(screen.getByText('No trending projects at the moment.')).toBeInTheDocument();
  });

  it('should render list of projects', () => {
    const mockProjects = [
      {
        id: 1,
        name: 'Project One',
        description: 'Description 1',
        image: 'https://example.com/image1.jpg',
      },
      {
        id: 2,
        name: 'Project Two',
        description: 'Description 2',
        image: 'https://example.com/image2.jpg',
      },
    ];

    render(<Trending projects={mockProjects} loading={false} />);
    
    expect(screen.getByText('Trending Projects')).toBeInTheDocument();
    expect(screen.getByText('Project One')).toBeInTheDocument();
    expect(screen.getByText('Project Two')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
  });

  it('should render project images with correct src', () => {
    const mockProjects = [
      {
        id: 1,
        name: 'Project One',
        description: 'Description 1',
        image: 'https://example.com/image1.jpg',
      },
    ];

    render(<Trending projects={mockProjects} loading={false} />);
    
    const image = screen.getByAltText('Project One');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image1.jpg');
  });

  it('should handle image error by setting fallback image', () => {
    const mockProjects = [
      {
        id: 1,
        name: 'Project One',
        description: 'Description 1',
        image: 'https://example.com/broken-image.jpg',
      },
    ];

    render(<Trending projects={mockProjects} loading={false} />);
    
    const image = screen.getByAltText('Project One');
    fireEvent.error(image);
    
    expect(image).toHaveAttribute('src', 'https://picsum.photos/60?random=1');
  });

  it('should render multiple projects correctly', () => {
    const mockProjects = [
      { id: 1, name: 'Project 1', description: 'Desc 1', image: 'img1.jpg' },
      { id: 2, name: 'Project 2', description: 'Desc 2', image: 'img2.jpg' },
      { id: 3, name: 'Project 3', description: 'Desc 3', image: 'img3.jpg' },
    ];

    render(<Trending projects={mockProjects} loading={false} />);
    
    mockProjects.forEach(project => {
      expect(screen.getByText(project.name)).toBeInTheDocument();
      expect(screen.getByText(project.description)).toBeInTheDocument();
    });
  });

  it('should render with proper CSS classes', () => {
    const mockProjects = [
      {
        id: 1,
        name: 'Project One',
        description: 'Description 1',
        image: 'https://example.com/image1.jpg',
      },
    ];

    const { container } = render(<Trending projects={mockProjects} loading={false} />);
    
    expect(container.querySelector('.trending-bar')).toBeInTheDocument();
    expect(container.querySelector('.trending-card')).toBeInTheDocument();
    expect(container.querySelector('.trending-img')).toBeInTheDocument();
  });

  it('should default loading to false when not provided', () => {
    const mockProjects = [
      {
        id: 1,
        name: 'Project One',
        description: 'Description 1',
        image: 'image.jpg',
      },
    ];

    render(<Trending projects={mockProjects} />);
    
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.getByText('Project One')).toBeInTheDocument();
  });

  it('should handle empty projects array with loading false', () => {
    render(<Trending projects={[]} loading={false} />);
    
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    expect(screen.getByText('No trending projects at the moment.')).toBeInTheDocument();
  });

  it('should render correct number of trending cards', () => {
    const mockProjects = [
      { id: 1, name: 'P1', description: 'D1', image: 'i1.jpg' },
      { id: 2, name: 'P2', description: 'D2', image: 'i2.jpg' },
      { id: 3, name: 'P3', description: 'D3', image: 'i3.jpg' },
      { id: 4, name: 'P4', description: 'D4', image: 'i4.jpg' },
      { id: 5, name: 'P5', description: 'D5', image: 'i5.jpg' },
    ];

    const { container } = render(<Trending projects={mockProjects} loading={false} />);
    
    const cards = container.querySelectorAll('.trending-card');
    expect(cards).toHaveLength(5);
  });
});
