import PasswordInput from '../components/PasswordInput';
import { FormEvent, MouseEvent } from 'preact/compat';
import { useState, useRef, useCallback, useEffect } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import { signal } from '@preact/signals';
import { Copy, Download } from 'lucide-preact';
import Toast from '../components/Toast';

import './WelcomePage.scss';

const MINIMUM_PASSWORD_LENGTH = 4;
const allowRedirect = signal(false);

function allow() {
  setTimeout(() => {
    allowRedirect.value = true;
  }, 1500);
}

function WelcomePage() {
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmationRef = useRef<HTMLInputElement>(null);
  const [passwordError, setPasswordError] = useState('');
  const [confirmationError, setConfirmationError] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const location = useLocation();

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    const passwordValue = passwordRef.current?.value || '';
    const confirmationValue = confirmationRef.current?.value || '';

    if (passwordValue.length < MINIMUM_PASSWORD_LENGTH) {
      setPasswordError("must contain at least 4 characters");
      return;
    } else if (confirmationValue !== passwordValue) {
      setConfirmationError("password confirmation does not match");
      return;
    }

    try {
      const recoveryKey = await window.user.storePassword(passwordValue);
      setRecoveryKey(recoveryKey);
    }
    catch (err) {
      console.error(err);
    }
  }, []);

  const copyToClipboard = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    navigator.clipboard.writeText(recoveryKey)
      .then(() => {
        setShowToast(true);
        setToastMessage('Copied to the clipboard!');
        allow();
      })
      .catch((err) => {
        setShowToast(true);
        setToastMessage('');
      });
  }, [recoveryKey]);

  const downloadFile = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    const blob = new Blob([recoveryKey], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recovery-key.txt';
    a.click();
    URL.revokeObjectURL(url);

    allow();
  }, [recoveryKey]);

  const redirectHome = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    location.route('/')
  }, []);

  useEffect(() => {
    // scroll to bottom
    const rootContainer = document.getElementById('root-container')!;
    rootContainer.scrollTo({
      top: rootContainer.scrollHeight,
      behavior: 'smooth',
    });
  }, [allowRedirect.value])

  if (recoveryKey) return (
    <div>
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
          <span className="recovery-key">{recoveryKey}</span>
          <button
            className="save-btn"
            data-label="copy"
            onClick={copyToClipboard}
          >
            <Copy display="block"/>
          </button>
          <button
            className="save-btn"
            data-label="save"
            onClick={downloadFile}
          >
            <Download display="block"/>
          </button>
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

  return (
    <div>
      <header className="page-header">
        <h1>Welcome!</h1>
        <p>Please set a password for this application.</p>
      </header>
      <form className="input-container" onSubmit={handleSubmit}>
        <PasswordInput
          inputRef={passwordRef}
          errorText={passwordError}
          setErrorState={setPasswordError}
        />
        <PasswordInput
          inputRef={confirmationRef}
          placeholder='confirm'
          errorText={confirmationError}
          setErrorState={setConfirmationError}
          preventPasting
        />
        <input className="submit-btn" type="submit" value="Set Password" />
      </form>
    </div>
  )
}

export default WelcomePage;