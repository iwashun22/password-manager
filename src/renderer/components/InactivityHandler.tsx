import { useEffect, useCallback } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import { signal } from '@preact/signals';

const inactivityTimeout = signal<ReturnType<typeof setTimeout> | null>(null);
export const previousPath = signal<string>('');
export const logoutSignal = signal(false);

interface Props {
  excludePaths: string[]
}

function InactivityHandler({ excludePaths }: Props) {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.path;
    const resetInactivityTimer = () => {
      if (inactivityTimeout.value) clearTimeout(inactivityTimeout.value);

      if (excludePaths.includes(currentPath)) return;
      inactivityTimeout.value = setTimeout(() => {
        previousPath.value = currentPath;
        logoutSignal.value = true;
        location.route('/login');
      }, 3 * 60 * 1000);
    }
    resetInactivityTimer();

    const events: Array<keyof WindowEventMap> = ["mousemove", "mousedown", "touchstart", "click"];

    if (!excludePaths.includes(location.path)) {
      resetInactivityTimer();
      events.forEach(e => {
        window.addEventListener(e, resetInactivityTimer);
      });
    }

    return () => {
      events.forEach(e => {
        window.removeEventListener(e, resetInactivityTimer);
      })
    }
  }, [location]);

  return null;
}

export default InactivityHandler;