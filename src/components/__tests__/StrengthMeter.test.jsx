import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StrengthMeter from '../StrengthMeter';
import { LanguageProvider } from '../../i18n/LanguageProvider';

function renderWithLang(ui) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

it('displays Weak for low entropy', () => {
  renderWithLang(<StrengthMeter entropy={0} />);
  expect(screen.getByText('ضعيفة')).toBeInTheDocument();
});

it('displays Medium for medium entropy', () => {
  renderWithLang(<StrengthMeter entropy={30} />);
  expect(screen.getByText('متوسطة')).toBeInTheDocument();
});

it('displays Strong for high entropy', () => {
  renderWithLang(<StrengthMeter entropy={40} />);
  expect(screen.getByText('قوية')).toBeInTheDocument();
});

it('displays Very Strong for very high entropy', () => {
  renderWithLang(<StrengthMeter entropy={65} />);
  expect(screen.getByText('قوية جداً')).toBeInTheDocument();
});

it('renders 4 bar segments', () => {
  const { container } = renderWithLang(<StrengthMeter entropy={40} />);
  const bars = container.querySelectorAll('.rounded-full');
  expect(bars.length).toBeGreaterThanOrEqual(4);
});

it('bar container has role=img with correct strength label', () => {
  renderWithLang(<StrengthMeter entropy={40} />);
  const bars = screen.getAllByRole('img');
  expect(bars[0]).toHaveAttribute('aria-label', 'قوة كلمة المرور: قوية');
});
