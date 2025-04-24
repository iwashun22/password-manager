import { useEffect } from 'preact/hooks';
import { createPortal } from 'preact/compat';
import { X } from 'lucide-preact';

import './Toast.scss';

interface Props {
  message: string,
  onClose: () => void,
  variant?: "info" | "error" | "success"
  timeout?: number
}

function Toast({
  message,
  onClose,
  variant = "info",
  timeout = 2000,
}: Props) {
  useEffect(() => {
    const timer = setTimeout(onClose, timeout);
    return () => clearTimeout(timer);
  }, []);

  return createPortal(
    <div className={`toast ${variant}`}>
      <span className="message">
        { message }
      </span>
      <button onClick={() => onClose()}>
        <X display="block" className="icon"/>
      </button>
    </div>,
    document.getElementById("portal-root")!
  )
}

export default Toast;