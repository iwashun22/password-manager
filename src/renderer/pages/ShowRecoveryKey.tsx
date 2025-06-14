import { useState, useCallback, useEffect, useRef } from 'preact/hooks';
import { MouseEvent } from 'preact/compat';
import { useLocation } from 'preact-iso';
import { signal } from '@preact/signals';
import Toast from '@/components/Toast';
import { Copy, Download } from 'lucide-preact';
import { recoveryKeySignal } from '@/components/CreateNew';

import './ShowRecoveryKey.scss';

const allowRedirect = signal(false);
function allow() {
  setTimeout(() => {
    allowRedirect.value = true;
  }, 1500);
}

function ShowRecoveryKey() {
  const location = useLocation();
  const key = recoveryKeySignal.value;
  // 5xBCD7u9hf/b8xZT
  const scrollContainer = useRef<HTMLDivElement>(null);
  const keySpanRef = useRef<HTMLSpanElement>(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  if (!key) location.route('/');

  useEffect(() => {
    keySpanRef.current?.addEventListener("copy", allow);

    return () => {
      keySpanRef.current?.removeEventListener("copy", allow);
    }
  }, []);

  const copyToClipboard = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    navigator.clipboard.writeText(key)
      .then(() => {
        setShowToast(true);
        setToastMessage('Copied to the clipboard!');
        allow();
      })
      .catch((err) => {
        setShowToast(true);
        setToastMessage('');
      });
  }, [key]);

  const downloadFile = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    const blob = new Blob([key], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recovery-key.txt';
    a.click();
    URL.revokeObjectURL(url);

    allow();
  }, [key]);

  const redirectHome = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    location.route('/')
  }, []);

  useEffect(() => {
    // scroll to bottom
    const container = scrollContainer.current
    if (!container) return;
    if (!allowRedirect.value) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    });
  }, [allowRedirect.value]);

  return (
    <div className="scroll-container" ref={scrollContainer}>
      {
        showToast &&
        <Toast
          message={
            toastMessage ? toastMessage : "Failed to copy to the clipboard."
          }
          onClose={() => setShowToast(false)}
          variant={
            toastMessage ? "success" : "error"
          }
        />
      }
      <header className="page-header">
        <h1>Password has been set!</h1>
        <p>
          Every time you open this application, you will be required to enter this password. Please do not forget it.
        </p>
      </header>
      <main className="important-area">
        <p className="important">
          Save your recovery key somewhere safe.
          <b>You won't be able to see it again</b>, and it's important for recovering your account if you forget your password or need to back up your data.
        </p>
        <div className="recovery-container">
          <span className="recovery-key" ref={keySpanRef}>{key}</span>
          <div className="button-container">
            <button
              className="save-btn"
              data-label="copy"
              onClick={copyToClipboard}
            >
              <Copy className="icon"/>
            </button>
            <button
              className="save-btn"
              data-label="save"
              onClick={downloadFile}
            >
              <Download className="icon"/>
            </button>
          </div>
        </div>
      </main>
      {
        allowRedirect.value &&
        <footer className="redirect-btn-container">
          <button
            className="redirect-btn"
            onClick={redirectHome}
          >
            I have saved the RECOVERY KEY
          </button>
        </footer>
      }
    </div>
  )
}

export default ShowRecoveryKey;