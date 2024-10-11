import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Button from '../../components/Button';

describe('Button component', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Button>Test Button</Button>);
    expect(getByText('Test Button')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    const { getByText } = render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    const { getByText } = render(<Button disabled>Disabled Button</Button>);
    expect(getByText('Disabled Button')).toBeDisabled();
  });
});