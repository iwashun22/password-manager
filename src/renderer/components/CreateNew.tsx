import { useState, useCallback, useRef } from 'preact/hooks';
import { FormEvent } from 'preact/compat';
import { signal } from '@preact/signals';
import { useLocation } from 'preact-iso';
import PasswordInput from './PasswordInput';
import CardButtonIcon from './CardButtonIcon';
import { setError } from './ErrorHandler';

import './CreateNew.scss';

const MINIMUM_PASSWORD_LENGTH = 4;

export const showBackButton = signal(true);
export const recoveryKeySignal = signal('');

function CreateNew() {
  const location = useLocation();
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmationRef = useRef<HTMLInputElement>(null);
  const [passwordError, setPasswordError] = useState('');
  const [confirmationError, setConfirmationError] = useState('');

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    const passwordValue = passwordRef.current?.value || '';
    const confirmationValue = confirmationRef.current?.value || '';

    if (passwordValue.length < MINIMUM_PASSWORD_LENGTH) {
      setPasswordError("must contain at least 4 characters");
      return;
    } else if (confirmationValue !== passwordValue) {
      setConfirmationError("confirmation password does not match");
      return;
    }

    const recoveryKey = await window.user.storePassword(passwordValue);

    if (recoveryKey === null) {
      setError('Something went wrong');
      return;
    }

    recoveryKeySignal.value = recoveryKey;
    location.route('/recovery-key');
  }, []);

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
        <CardButtonIcon text='set password' type='submit'/>
      </form>
    </div>
  )
}

export default CreateNew;