import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SimpleNewspaperCard } from '../SimpleNewspaperCard';
import { PublicationItem } from '../services';

// 模拟数据
const mockPublication: PublicationItem = {
  i: 0,
  id: 'test-publication-1',
  collection: 'https://example.com/collection.json',
  title: '生活周刊',
  name: '生活周刊',
  issueCount: 10,
  lastUpdated: '2023-01-01'
};

describe('SimpleNewspaperCard', () => {
  test('renders publication title correctly', () => {
    const onClick = jest.fn();
    
    render(
      <SimpleNewspaperCard
        publication={mockPublication}
        onClick={onClick}
      />
    );

    expect(screen.getByText('生活周刊')).toBeInTheDocument();
    expect(screen.getByText('查看本刊')).toBeInTheDocument();
  });

  test('calls onClick when card is clicked', () => {
    const onClick = jest.fn();
    
    render(
      <SimpleNewspaperCard
        publication={mockPublication}
        onClick={onClick}
      />
    );

    fireEvent.click(screen.getByText('生活周刊'));
    expect(onClick).toHaveBeenCalledWith(mockPublication);
  });

  test('calls onClick when button is clicked', () => {
    const onClick = jest.fn();
    
    render(
      <SimpleNewspaperCard
        publication={mockPublication}
        onClick={onClick}
      />
    );

    fireEvent.click(screen.getByText('查看本刊'));
    expect(onClick).toHaveBeenCalledWith(mockPublication);
  });

  test('applies selected style when isSelected is true', () => {
    const onClick = jest.fn();
    
    const { container } = render(
      <SimpleNewspaperCard
        publication={mockPublication}
        isSelected={true}
        onClick={onClick}
      />
    );

    expect(container.firstChild).toHaveClass('simple-newspaper-card--selected');
  });

  test('does not apply selected style when isSelected is false', () => {
    const onClick = jest.fn();
    
    const { container } = render(
      <SimpleNewspaperCard
        publication={mockPublication}
        isSelected={false}
        onClick={onClick}
      />
    );

    expect(container.firstChild).not.toHaveClass('simple-newspaper-card--selected');
  });

  test('handles keyboard navigation', () => {
    const onClick = jest.fn();
    
    render(
      <SimpleNewspaperCard
        publication={mockPublication}
        onClick={onClick}
      />
    );

    const card = screen.getByText('生活周刊').closest('.simple-newspaper-card');
    
    // Test Enter key
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledWith(mockPublication);
    
    // Reset mock
    onClick.mockClear();
    
    // Test Space key
    fireEvent.keyDown(card, { key: ' ' });
    expect(onClick).toHaveBeenCalledWith(mockPublication);
  });
});