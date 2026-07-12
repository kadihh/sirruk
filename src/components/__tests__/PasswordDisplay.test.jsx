import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PasswordDisplay from '../PasswordDisplay';

it('renders the password', () => {
  render(
    <PasswordDisplay
      password="testP@ss1"
      onCopy={vi.fn()}
      onRegenerate={vi.fn()}
      copied={false}
    />
  );
  expect(screen.getByText('testP@ss1')).toBeInTheDocument();
});

it('shows placeholder when password is empty', () => {
  render(
    <PasswordDisplay
      password=""
      onCopy={vi.fn()}
      onRegenerate={vi.fn()}
      copied={false}
    />
  );
  expect(screen.getByText('No password generated')).toBeInTheDocument();
});

it('shows custom empty message when provided', () => {
  render(
    <PasswordDisplay
      password=""
      onCopy={vi.fn()}
      onRegenerate={vi.fn()}
      copied={false}
      emptyMessage="Enable at least one character set"
    />
  );
  expect(screen.getByText('Enable at least one character set')).toBeInTheDocument();
});

it('fires onCopy when copy button clicked', () => {
  const onCopy = vi.fn();
  render(
    <PasswordDisplay
      password="testP@ss1"
      onCopy={onCopy}
      onRegenerate={vi.fn()}
      copied={false}
    />
  );
  fireEvent.click(screen.getByLabelText('Copy to clipboard'));
  expect(onCopy).toHaveBeenCalledOnce();
});

it('fires onRegenerate when regenerate button clicked', () => {
  const onRegenerate = vi.fn();
  render(
    <PasswordDisplay
      password="testP@ss1"
      onCopy={vi.fn()}
      onRegenerate={onRegenerate}
      copied={false}
    />
  );
  fireEvent.click(screen.getByLabelText('Regenerate'));
  expect(onRegenerate).toHaveBeenCalledOnce();
});

it('copy button is disabled when password is empty', () => {
  render(
    <PasswordDisplay
      password=""
      onCopy={vi.fn()}
      onRegenerate={vi.fn()}
      copied={false}
    />
  );
  expect(screen.getByLabelText('Copy to clipboard')).toBeDisabled();
});

it('regenerate button is disabled when password is empty', () => {
  render(
    <PasswordDisplay
      password=""
      onCopy={vi.fn()}
      onRegenerate={vi.fn()}
      copied={false}
    />
  );
  expect(screen.getByLabelText('Regenerate')).toBeDisabled();
});

it('shows copy failure message when copyFailed is true', () => {
  render(
    <PasswordDisplay
      password="test"
      onCopy={vi.fn()}
      onRegenerate={vi.fn()}
      copied={false}
      copyFailed={true}
    />
  );
  expect(screen.getByText('Copy failed — select and copy manually')).toBeInTheDocument();
});

it('shows Copied! indicator when copied is true', () => {
  render(
    <PasswordDisplay
      password="testP@ss1"
      onCopy={vi.fn()}
      onRegenerate={vi.fn()}
      copied={true}
    />
  );
  expect(screen.getByText('Copied!')).toBeInTheDocument();
});
