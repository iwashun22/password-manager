import { useRef, useCallback, useState } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import { createPortal, type FormEvent } from 'preact/compat';
import { previousPath } from '../components/InactivityHandler';
import PasswordInput from '@/components/PasswordInput';
import CardButtonIcon from '@/components/CardButtonIcon';
import { countDownTimeout, formattingTime } from '@/utils/helper';
import { signal } from '@preact/signals';
import { setError } from '@/components/ErrorHandler';
import BackButton from '@/components/BackButton';
import RecoveryKeyInput from '@/components/RecoveryKeyInput';

import './Authenticate.scss';

const showRecoveryKeyOption = signal(false);

function Authenticate() {
  const location = useLocation();
  const passwordRef = useRef<HTMLInputElement>(null);
  const [errorText, setErrorText] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [verifyViaRecoveryKey, setVerifyViaRecoveryKey] = useState(false);
  const [verified, setVerified] = useState(false);
  const recoveryKeyRef = useRef<HTMLTextAreaElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmationRef = useRef<HTMLInputElement>(null);
  const [newPasswordErr, setNewPasswordErr] = useState('');
  const [confirmationErr, setConfirmationErr] = useState('');

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    if (disabled) return;

    (async () => {
      if (!passwordRef.current || !passwordRef.current.value) return;

      const isMatched = await window.user.verifyPassword(passwordRef.current.value);

      if (typeof isMatched === 'number') {
        setDisabled(true);
        countDownTimeout(
          isMatched,
          (n) => {
            const time = formattingTime(n);
            setErrorText(`try again in ${time}`);
          },
          () => {
            setDisabled(false);
            setErrorText('');
          }
        );
        showRecoveryKeyOption.value = true;
        return;
      }

      if (isMatched) {
        showRecoveryKeyOption.value = false;
        location.route(previousPath.value);
      }
      else {
        setErrorText('Incorrect password');
      }
    })();
  }, [previousPath.value, disabled]);

  const toggleOption = useCallback((state: boolean) => () => {
    setVerifyViaRecoveryKey(state);
  }, []);

  const verifyRecoveryKey = useCallback((e: FormEvent) => {
    e.preventDefault();

    (async () => {
      const keyString = recoveryKeyRef.current?.value || '';
      const validKey = await window.backup.checkKeySize(keyString);

      if (validKey === null) throw new Error('Something went wrong');
      if (!validKey) throw new Error('Invalid key');

      const tokenMatched = await window.user.verifyRecoveryKey(keyString);

      if (!tokenMatched) throw new Error('Incorrect reovery key');

      setVerified(true);
    })()
      .catch(err => {
        setError(err.message);
      })
  }, []);

  const changePassword = useCallback((e: FormEvent) => {
    e.preventDefault();

    (async () => {
      const [newPassword, confirmation] = [newPasswordRef, confirmationRef].map(ref => ref.current?.value || '');

      if (!newPassword) {
        setNewPasswordErr('missing new password');
        return;
      }
      if (newPassword.length < 4) {
        setNewPasswordErr('must contain at least 4 characters');
        return;
      }

      if (newPassword !== confirmation) {
        setConfirmationErr('confirmation password does not match');
        return;
      }

      const info = await window.user.updatePassword(newPassword);
      if (info === null) throw new Error('Something went wrong');

      showRecoveryKeyOption.value = false;
      location.route('/');
    })()
      .catch(err => {
        setError(err.message);
      })
  }, []);

  if (verifyViaRecoveryKey)  {
    if (verified) return (
      <>
        <header className="page-header">
          <h2>Set New Password</h2>
        </header>
        <form onSubmit={changePassword} className="verify-form">
          <PasswordInput
            inputRef={newPasswordRef}
            placeholder='new password'
            errorText={newPasswordErr}
            setErrorState={setNewPasswordErr}
          />
          <PasswordInput
            inputRef={confirmationRef}
            placeholder='confirmation'
            errorText={confirmationErr}
            setErrorState={setConfirmationErr}
          />
          <CardButtonIcon type='submit' text='save' />
        </form>
      </>
    )
    else return (
      <>
        <BackButton onClick={toggleOption(false)} />
        <form onSubmit={verifyRecoveryKey}>
          <RecoveryKeyInput keyInputRef={recoveryKeyRef} />
          <br />
          <CardButtonIcon type='submit' text='verify' />
        </form>
      </>
    )
  }

  return (
    <div>
      <header className='page-header'>
        <h2>Enter Your Password</h2>
      </header>
      <form onSubmit={handleSubmit} className="verify-form">
        <PasswordInput
          inputRef={passwordRef}
          errorText={errorText}
          setErrorState={setErrorText}
          disabled={disabled}
          preventPasting
        />
        <CardButtonIcon type='submit' text='verify'/>
      </form>
      {
        showRecoveryKeyOption.value &&
        <RecoveryKeyOption onClick={toggleOption(true)} />
      }
    </div>
  )
}

function RecoveryKeyOption({ onClick }: {
  onClick: () => void
}) {
  return createPortal(
    <h3
      onClick={onClick}
      className="recovery-key-option"
    >
      Forgot the password? Verify via recovery key.
    </h3>,
    document.getElementById("bottom-portal")!
  )
}

export default Authenticate;