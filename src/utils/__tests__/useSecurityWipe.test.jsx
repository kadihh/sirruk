import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSecurityWipe } from '../useSecurityWipe';

describe('useSecurityWipe', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fires callback when document becomes hidden', () => {
    const onWipe = vi.fn();
    renderHook(() => useSecurityWipe(onWipe));

    act(() => {
      Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(onWipe).toHaveBeenCalledOnce();
  });

  it('does NOT fire callback when document becomes visible', () => {
    const onWipe = vi.fn();
    Object.defineProperty(document, 'hidden', { value: false, writable: true, configurable: true });
    renderHook(() => useSecurityWipe(onWipe));

    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(onWipe).not.toHaveBeenCalled();
  });

  it('does NOT fire callback on mount when already hidden', () => {
    const onWipe = vi.fn();
    Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true });
    renderHook(() => useSecurityWipe(onWipe));

    expect(onWipe).not.toHaveBeenCalled();
  });

  it('cleans up event listener on unmount', () => {
    const onWipe = vi.fn();
    const { unmount } = renderHook(() => useSecurityWipe(onWipe));

    const spy = vi.spyOn(document, 'removeEventListener');
    unmount();

    expect(spy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    spy.mockRestore();
  });

  it('calls new callback when identity changes', () => {
    const onWipe1 = vi.fn();
    const onWipe2 = vi.fn();

    const { rerender } = renderHook(
      ({ cb }) => useSecurityWipe(cb),
      { initialProps: { cb: onWipe1 } }
    );

    act(() => {
      Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(onWipe1).toHaveBeenCalledOnce();

    act(() => {
      Object.defineProperty(document, 'hidden', { value: false, writable: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    rerender({ cb: onWipe2 });

    act(() => {
      Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(onWipe2).toHaveBeenCalledOnce();
  });
});
