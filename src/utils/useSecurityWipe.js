import { useEffect } from 'react';

export function useSecurityWipe(onWipe) {
  useEffect(() => {
    const handle = () => {
      if (document.hidden) onWipe();
    };
    document.addEventListener('visibilitychange', handle);
    return () => document.removeEventListener('visibilitychange', handle);
  }, [onWipe]);
}
