import { it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PasswordDisplay from '../PasswordDisplay';
import { LanguageProvider } from '../../i18n/LanguageProvider';

function renderWithLang(ui) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

it('renders the password', () => {
  renderWithLang(
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
  renderWithLang(
    <PasswordDisplay
      password=""
      onCopy={vi.fn()}
      onRegenerate={vi.fn()}
      copied={false}
    />
  );
  expect(screen.getByText('لم يتم توليد كلمة مرور')).toBeInTheDocument();
});

it('shows custom empty message when provided', () => {
  renderWithLang(
    <PasswordDisplay
      password=""
      onCopy={vi.fn()}
      onRegenerate={vi.fn()}
      copied={false}
      emptyMessage="custom message"
    />
  );
  expect(screen.getByText('custom message')).toBeInTheDocument();
});

it('fires onCopy when copy button clicked', () => {
  const onCopy = vi.fn();
  renderWithLang(
    <PasswordDisplay
      password="testP@ss1"
      onCopy={onCopy}
      onRegenerate={vi.fn()}
      copied={false}
    />
  );
  fireEvent.click(screen.getByLabelText('نسخ إلى الحافظة'));
  expect(onCopy).toHaveBeenCalledOnce();
});

it('fires onRegenerate when regenerate button clicked', () => {
  const onRegenerate = vi.fn();
  renderWithLang(
    <PasswordDisplay
      password="testP@ss1"
      onCopy={vi.fn()}
      onRegenerate={onRegenerate}
      copied={false}
    />
  );
  fireEvent.click(screen.getByLabelText('إعادة توليد'));
  expect(onRegenerate).toHaveBeenCalledOnce();
});

it('copy button is disabled when password is empty', () => {
  renderWithLang(
    <PasswordDisplay
      password=""
      onCopy={vi.fn()}
      onRegenerate={vi.fn()}
      copied={false}
    />
  );
  expect(screen.getByLabelText('نسخ إلى الحافظة')).toBeDisabled();
});

it('regenerate button is disabled when password is empty', () => {
  renderWithLang(
    <PasswordDisplay
      password=""
      onCopy={vi.fn()}
      onRegenerate={vi.fn()}
      copied={false}
    />
  );
  expect(screen.getByLabelText('إعادة توليد')).toBeDisabled();
});

it('shows copy failure message when copyFailed is true', () => {
  renderWithLang(
    <PasswordDisplay
      password="test"
      onCopy={vi.fn()}
      onRegenerate={vi.fn()}
      copied={false}
      copyFailed={true}
    />
  );
  expect(screen.getByText('فشل النسخ — حدد النص وانسخ يدوياً')).toBeInTheDocument();
});

it('shows Copied! indicator when copied is true', () => {
  renderWithLang(
    <PasswordDisplay
      password="testP@ss1"
      onCopy={vi.fn()}
      onRegenerate={vi.fn()}
      copied={true}
    />
  );
  expect(screen.getByText('تم النسخ!')).toBeInTheDocument();
});
