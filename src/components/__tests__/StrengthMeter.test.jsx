import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StrengthMeter from '../StrengthMeter';

it('displays Weak for low entropy', () => {
  render(<StrengthMeter entropy={0} label="Weak" />);
  expect(screen.getByText('Weak')).toBeInTheDocument();
});

it('displays Medium for medium entropy', () => {
  render(<StrengthMeter entropy={30} label="Medium" />);
  expect(screen.getByText('Medium')).toBeInTheDocument();
});

it('displays Strong for high entropy', () => {
  render(<StrengthMeter entropy={40} label="Strong" />);
  expect(screen.getByText('Strong')).toBeInTheDocument();
});

it('displays Very Strong for very high entropy', () => {
  render(<StrengthMeter entropy={65} label="Very Strong" />);
  expect(screen.getByText('Very Strong')).toBeInTheDocument();
});

it('renders 4 bar segments', () => {
  const { container } = render(<StrengthMeter entropy={40} label="Strong" />);
  const bars = container.querySelectorAll('.rounded-full');
  expect(bars.length).toBeGreaterThanOrEqual(4);
});

it('bar container has role=img with correct strength label', () => {
  render(<StrengthMeter entropy={40} label="Strong" />);
  const bars = screen.getAllByRole('img');
  expect(bars[0]).toHaveAttribute('aria-label', 'Password strength: Strong');
});

it('shows Strength: label prefix', () => {
  render(<StrengthMeter entropy={0} label="Weak" />);
  expect(screen.getByText(/Strength:/)).toBeInTheDocument();
});

it('shows entropy bits when entropy > 0', () => {
  render(<StrengthMeter entropy={40} label="Strong" />);
  expect(screen.getByText(/40 bits/)).toBeInTheDocument();
});

it('shows crack time estimate when entropy > 0', () => {
  render(<StrengthMeter entropy={60} label="Very Strong" />);
  expect(screen.getByText(/to crack/)).toBeInTheDocument();
});

it('does not show entropy when entropy is 0', () => {
  render(<StrengthMeter entropy={0} label="Weak" />);
  expect(screen.queryByText(/bits/)).not.toBeInTheDocument();
});
