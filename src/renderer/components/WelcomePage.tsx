import PasswordInput from './PasswordInput';
import { FormEvent } from 'preact/compat';
import { useState, useRef, useCallback } from 'preact/hooks';

import './WelcomePage.scss';

const MINIMUM_PASSWORD_LENGTH = 4;

function WelcomePage() {
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmationRef = useRef<HTMLInputElement>(null);
  const [passwordError, setPasswordError] = useState('');
  const [confirmationError, setConfirmationError] = useState('');

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    const passwordValue = passwordRef.current?.value || '';
    const confirmationValue = confirmationRef.current?.value || '';

    if (passwordValue.length < MINIMUM_PASSWORD_LENGTH) {
      setPasswordError("must contain at least 4 characters");
    } else if (confirmationValue !== passwordValue) {
      setConfirmationError("password confirmation does not match")
    }
  }, []);

  return (
    <div>
      <h1>Welcome!</h1>
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
        <input type="submit" value="Set Password" />
      </form>
    </div>
  )
}

export default WelcomePage;