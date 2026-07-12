import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LengthSlider from '../LengthSlider';

it('renders label and value', () => {
  render(<LengthSlider value={16} onChange={vi.fn()} min={8} max={64} label="Length" />);
  expect(screen.getByText('Length')).toBeInTheDocument();
  expect(screen.getByLabelText('Length value')).toHaveValue(16);
});

it('label is associated with slider via htmlFor and id', () => {
  render(<LengthSlider value={16} onChange={vi.fn()} min={8} max={64} label="Length" />);
  const label = screen.getByText('Length');
  const slider = screen.getByRole('slider');
  expect(label).toHaveAttribute('for', 'length-slider');
  expect(slider).toHaveAttribute('id', 'length-slider');
});

it('calls onChange when slider changes', () => {
  const onChange = vi.fn();
  render(<LengthSlider value={16} onChange={onChange} min={8} max={64} label="Length" />);
  const slider = screen.getByRole('slider');
  fireEvent.change(slider, { target: { value: '24' } });
  expect(onChange).toHaveBeenCalledWith(24);
});

it('calls onChange when number input changes', () => {
  const onChange = vi.fn();
  render(<LengthSlider value={16} onChange={onChange} min={8} max={64} label="Length" />);
  const input = screen.getByLabelText('Length value');
  fireEvent.change(input, { target: { value: '32' } });
  expect(onChange).toHaveBeenCalledWith(32);
});
