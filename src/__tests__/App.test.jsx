import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../App';

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
    render(<App />);
    expect(screen.getByText('sirruk')).toBeInTheDocument();
  });

  it('renders the password display area', () => {
    render(<App />);
    expect(screen.getByLabelText('Copy to clipboard')).toBeInTheDocument();
    expect(screen.getByLabelText('Regenerate')).toBeInTheDocument();
  });

  it('renders the strength meter', () => {
    render(<App />);
    expect(screen.getByText(/Weak|Medium|Strong|Very Strong/)).toBeInTheDocument();
  });

  it('renders all character set toggles', () => {
    render(<App />);
    expect(screen.getByText('A–Z')).toBeInTheDocument();
    expect(screen.getByText('a–z')).toBeInTheDocument();
    expect(screen.getByText('0–9')).toBeInTheDocument();
    expect(screen.getByText('!@#$')).toBeInTheDocument();
  });

  it('renders length slider with default value', () => {
    render(<App />);
    expect(screen.getByLabelText('Length value')).toHaveValue(16);
  });

  it('toggling off all charsets shows empty message', () => {
    render(<App />);
    const toggles = screen.getAllByRole('checkbox');
    toggles.forEach(toggle => {
      if (toggle.checked) fireEvent.click(toggle);
    });
    expect(screen.getByText('Enable at least one character set')).toBeInTheDocument();
  });
});

describe('App integration', () => {
  it('generates a password on mount', () => {
    render(<App />);
    const passwordSpan = document.querySelector('span.font-mono');
    expect(passwordSpan.textContent.length).toBeGreaterThan(0);
    expect(passwordSpan.textContent).not.toBe('No password generated');
  });

  it('regenerate button produces a new password', () => {
    render(<App />);
    const passwordSpan = document.querySelector('span.font-mono');
    const first = passwordSpan.textContent;

    let changed = false;
    for (let i = 0; i < 20; i++) {
      fireEvent.click(screen.getByLabelText('Regenerate'));
      if (passwordSpan.textContent !== first) { changed = true; break; }
    }
    expect(changed).toBe(true);
  });

  it('password changes when a charset is toggled', () => {
    render(<App />);
    const passwordBefore = document.querySelector('span.font-mono').textContent;

    const toggles = screen.getAllByRole('checkbox');
    const symbolsToggle = toggles[3];
    if (!symbolsToggle.checked) fireEvent.click(symbolsToggle);

    const passwordAfter = document.querySelector('span.font-mono').textContent;
    expect(passwordAfter).not.toBe(passwordBefore);
  });

  it('strength meter shows label', () => {
    render(<App />);
    const text = screen.getByText(/Weak|Medium|Strong|Very Strong/).textContent;
    expect(text).toMatch(/Weak|Medium|Strong|Very Strong/);
  });
});

describe('clipboard', () => {
  it('shows "Copied!" after successful copy', async () => {
    render(<App />);

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Copy to clipboard'));
    });

    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });

  it('shows error message after clipboard failure', async () => {
    navigator.clipboard.writeText.mockRejectedValueOnce(new Error('denied'));
    render(<App />);

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Copy to clipboard'));
    });

    expect(screen.getByText(/Copy failed/)).toBeInTheDocument();
  });

  it('clears "Copied!" after timeout', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<App />);

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Copy to clipboard'));
    });
    expect(screen.getByText('Copied!')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.queryByText('Copied!')).not.toBeInTheDocument();
  });

  it('clears clipboard error after timeout', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    navigator.clipboard.writeText.mockRejectedValueOnce(new Error('denied'));
    render(<App />);

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Copy to clipboard'));
    });
    expect(screen.getByText(/Copy failed/)).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.queryByText(/Copy failed/)).not.toBeInTheDocument();
  });
});

describe('security wipe', () => {
  it('clears password on visibility change to hidden', () => {
    render(<App />);
    const passwordSpan = document.querySelector('span.font-mono');
    const before = passwordSpan.textContent;
    expect(before.length).toBeGreaterThan(0);

    act(() => {
      Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(passwordSpan.textContent).not.toBe(before);
    expect(passwordSpan.textContent).toBe('No password generated');
  });

  it('wipes clipboard on visibility change', () => {
    const writeText = navigator.clipboard.writeText;
    render(<App />);

    act(() => {
      Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(writeText).toHaveBeenCalledWith('');
  });

  it('regenerates password when tab becomes visible again', async () => {
    render(<App />);
    const passwordSpan = document.querySelector('span.font-mono');

    act(() => {
      Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(passwordSpan.textContent).toBe('No password generated');

    await act(async () => {
      Object.defineProperty(document, 'hidden', { value: false, writable: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(passwordSpan.textContent.length).toBeGreaterThan(0);
    expect(passwordSpan.textContent).not.toBe('No password generated');
  });
});
