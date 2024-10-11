import React from 'react';
import { render } from '@testing-library/react';
import ErrorMessage from '../../components/ErrorMessage';

describe('ErrorMessage component', () => {
  it('renders the error message', () => {
    const errorMessage = 'This is an error message';
    const { getByText } = render(<ErrorMessage message={errorMessage} />);
    expect(getByText('エラー:')).toBeInTheDocument();
    expect(getByText(errorMessage)).toBeInTheDocument();
  });
});