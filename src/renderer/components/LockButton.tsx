import { useCallback } from 'preact/hooks';
import { createPortal } from 'preact/compat';
import { LockKeyhole } from 'lucide-preact';
import { useLocation } from 'preact-iso';
import { logoutSignal } from './InactivityHandler';

import './LockButton.scss';

interface Props {
  excludePaths: string[]
}

function LockButton({ excludePaths }: Props) {
  const location = useLocation();
  const logout = useCallback(() => {
    logoutSignal.value = true;
  }, []);

  if (excludePaths.includes(location.path)) return null;

  return createPortal(
    <button
      className="lock-btn"
      onClick={logout}
    >
      <LockKeyhole className="icon"/>
    </button>,
    document.getElementById("bottom-portal")!
  )
}

export default LockButton;