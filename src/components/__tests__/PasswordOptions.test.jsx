import { it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PasswordOptions from '../PasswordOptions';

const defaultProps = {
  length: 16,
  onLengthChange: vi.fn(),
  uppercase: true,
  onUppercaseChange: vi.fn(),
  lowercase: true,
  onLowercaseChange: vi.fn(),
  numbers: true,
  onNumbersChange: vi.fn(),
  symbols: false,
  onSymbolsChange: vi.fn(),
  excludeAmbiguous: false,
  onExcludeAmbiguousChange: vi.fn(),
};

it('renders length slider and toggles', () => {
  render(<PasswordOptions {...defaultProps} />);
  expect(screen.getByText('Length')).toBeInTheDocument();
  expect(screen.getByLabelText('Length value')).toHaveValue(16);
  expect(screen.getByText('A–Z')).toBeInTheDocument();
  expect(screen.getByText('a–z')).toBeInTheDocument();
  expect(screen.getByText('0–9')).toBeInTheDocument();
  expect(screen.getByText('!@#$')).toBeInTheDocument();
});
