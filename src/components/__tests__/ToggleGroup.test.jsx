import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ToggleGroup from '../ToggleGroup';

it('renders all toggles', () => {
  const toggles = [
    { key: 'a', label: 'A–Z', checked: true, onChange: vi.fn() },
    { key: 'b', label: 'a–z', checked: false, onChange: vi.fn() },
  ];
  render(<ToggleGroup toggles={toggles} />);
  expect(screen.getByText('A–Z')).toBeInTheDocument();
  expect(screen.getByText('a–z')).toBeInTheDocument();
});

it('fires onChange when a toggle is clicked', () => {
  const onChange = vi.fn();
  const toggles = [
    { key: 'test', label: 'Test', checked: false, onChange },
  ];
  render(<ToggleGroup toggles={toggles} />);
  fireEvent.click(screen.getByText('Test'));
  expect(onChange).toHaveBeenCalledWith(true);
});

it('fires onChange when an already-checked toggle is clicked', () => {
  const onChange = vi.fn();
  const toggles = [
    { key: 'test', label: 'Test', checked: true, onChange },
  ];
  render(<ToggleGroup toggles={toggles} />);
  fireEvent.click(screen.getByText('Test'));
  expect(onChange).toHaveBeenCalledWith(false);
});
