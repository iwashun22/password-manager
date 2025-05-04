import { useEffect } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import { signal } from '@preact/signals';

const inactivityTimeout = signal<ReturnType<typeof setTimeout> | null>(null);
export const previousPath = signal<string>('');
export const logoutSignal = signal(true);

interface Props {
  excludePaths: string[]
}

function InactivityHandler({ excludePaths }: Props) {
  const location = useLocation();

  useEffect(() => {
    if (logoutSignal.value) {
      logoutSignal.value = false;
      location.route('/auth');
    }
  }, [logoutSignal.value]);

  useEffect(() => {
    (async() => {
      try {
        const passwordData = await window.user.getSystemPassword();
        if (!passwordData) {
          location.route('/welcome');
        }
      }
      catch (err) {
        console.error(err);
        location.route('/force-delete');
      }
    })();

    const currentPath = location.path;

    if (!excludePaths.includes(currentPath)) {
      previousPath.value = currentPath;
    }

    const resetInactivityTimer = () => {
      if (inactivityTimeout.value) clearTimeout(inactivityTimeout.value);

      if (excludePaths.includes(currentPath)) return;
      inactivityTimeout.value = setTimeout(() => {
        previousPath.value = currentPath;
        location.route('/auth');
      }, 60 * 1000);
    }

    const events: Array<keyof WindowEventMap> = ["mousemove", "mousedown", "touchstart", "click"];

    if (excludePaths.includes(location.path)) {
      if (inactivityTimeout.value) clearTimeout(inactivityTimeout.value);
      events.forEach(e => {
        window.removeEventListener(e, resetInactivityTimer);
      });
      return;
    }
    else {
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
  }, [location.path]);

  return null;
}

export default InactivityHandler;