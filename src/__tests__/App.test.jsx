import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../App';
import { LanguageProvider } from '../i18n/LanguageProvider';

function renderApp() {
  return render(<LanguageProvider><App /></LanguageProvider>);
}

function mockClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined);
  const readText = vi.fn().mockResolvedValue('');
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText, readText },
    writable: true,
    configurable: true,
  });
  return writeText;
}

beforeEach(() => {
  mockClipboard();
  Object.defineProperty(document, 'hidden', { value: false, writable: true, configurable: true });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('App rendering', () => {
  it('renders the app title', () => {
    renderApp();
    expect(screen.getByText('سِرّك')).toBeInTheDocument();
  });

  it('renders the password display area', () => {
    renderApp();
    expect(screen.getByLabelText('نسخ إلى الحافظة')).toBeInTheDocument();
    expect(screen.getByLabelText('إعادة توليد')).toBeInTheDocument();
  });

  it('renders the strength meter', () => {
    renderApp();
    const labels = screen.getAllByText(/ضعيفة|متوسطة|قوية|قوية جداً/);
    expect(labels.length).toBeGreaterThanOrEqual(1);
  });

  it('renders all character set toggles', () => {
    renderApp();
    expect(screen.getByText('A–Z')).toBeInTheDocument();
    expect(screen.getByText('a–z')).toBeInTheDocument();
    expect(screen.getByText('0–9')).toBeInTheDocument();
    expect(screen.getByText('!@#$')).toBeInTheDocument();
  });

  it('renders length slider with default value', () => {
    renderApp();
    expect(screen.getByLabelText('الطول value')).toHaveValue(16);
  });

  it('toggling off all charsets shows empty message', () => {
    renderApp();
    const toggles = screen.getAllByRole('checkbox');
    toggles.forEach(toggle => {
      if (toggle.checked) fireEvent.click(toggle);
    });
    expect(screen.getByText('فعّل مجموعة أحرف واحدة على الأقل')).toBeInTheDocument();
  });
});

describe('App integration', () => {
  it('generates a password on mount', () => {
    renderApp();
    const passwordSpan = document.querySelector('span.font-mono');
    expect(passwordSpan.textContent.length).toBeGreaterThan(0);
    expect(passwordSpan.textContent).not.toBe('لم يتم توليد كلمة مرور');
  });

  it('regenerate button produces a new password', () => {
    renderApp();
    const passwordSpan = document.querySelector('span.font-mono');
    const first = passwordSpan.textContent;

    let changed = false;
    for (let i = 0; i < 20; i++) {
      fireEvent.click(screen.getByLabelText('إعادة توليد'));
      if (passwordSpan.textContent !== first) { changed = true; break; }
    }
    expect(changed).toBe(true);
  });

  it('password changes when a charset is toggled', () => {
    renderApp();
    const passwordBefore = document.querySelector('span.font-mono').textContent;

    const toggles = screen.getAllByRole('checkbox');
    const symbolsToggle = toggles[3];
    if (!symbolsToggle.checked) fireEvent.click(symbolsToggle);

    const passwordAfter = document.querySelector('span.font-mono').textContent;
    expect(passwordAfter).not.toBe(passwordBefore);
  });

  it('strength meter shows label', () => {
    renderApp();
    const labels = screen.getAllByText(/ضعيفة|متوسطة|قوية|قوية جداً/);
    expect(labels[0].textContent).toMatch(/ضعيفة|متوسطة|قوية|قوية جداً/);
  });
});

describe('clipboard', () => {
  it('shows "تم النسخ!" after successful copy', async () => {
    renderApp();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('نسخ إلى الحافظة'));
    });

    expect(screen.getByText('تم النسخ!')).toBeInTheDocument();
  });

  it('shows error message after clipboard failure', async () => {
    navigator.clipboard.writeText.mockRejectedValueOnce(new Error('denied'));
    renderApp();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('نسخ إلى الحافظة'));
    });

    expect(screen.getByText(/فشل النسخ/)).toBeInTheDocument();
  });

  it('clears "تم النسخ!" after timeout', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderApp();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('نسخ إلى الحافظة'));
    });
    expect(screen.getByText('تم النسخ!')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.queryByText('تم النسخ!')).not.toBeInTheDocument();
  });

  it('clears clipboard error after timeout', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    navigator.clipboard.writeText.mockRejectedValueOnce(new Error('denied'));
    renderApp();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('نسخ إلى الحافظة'));
    });
    expect(screen.getByText(/فشل النسخ/)).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.queryByText(/فشل النسخ/)).not.toBeInTheDocument();
  });
});

describe('security wipe', () => {
  it('clears password on visibility change to hidden', () => {
    renderApp();
    const passwordSpan = document.querySelector('span.font-mono');
    const before = passwordSpan.textContent;
    expect(before.length).toBeGreaterThan(0);

    act(() => {
      Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(passwordSpan.textContent).not.toBe(before);
    expect(passwordSpan.textContent).toBe('لم يتم توليد كلمة مرور');
  });

  it('wipes clipboard on visibility change', () => {
    const writeText = navigator.clipboard.writeText;
    renderApp();

    act(() => {
      Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(writeText).toHaveBeenCalledWith('');
  });

  it('regenerates password when tab becomes visible again', async () => {
    renderApp();
    const passwordSpan = document.querySelector('span.font-mono');

    act(() => {
      Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(passwordSpan.textContent).toBe('لم يتم توليد كلمة مرور');

    await act(async () => {
      Object.defineProperty(document, 'hidden', { value: false, writable: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(passwordSpan.textContent.length).toBeGreaterThan(0);
    expect(passwordSpan.textContent).not.toBe('لم يتم توليد كلمة مرور');
  });
});
