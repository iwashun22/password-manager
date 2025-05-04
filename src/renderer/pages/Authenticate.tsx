import { useRef, useCallback, useState } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import { FormEvent } from 'preact/compat';
import { previousPath } from '../components/InactivityHandler';
import PasswordInput from '@/components/PasswordInput';
import CardButtonIcon from '@/components/CardButtonIcon';

import './Authenticate.scss';

function Authenticate() {
  const location = useLocation();
  const passwordRef = useRef<HTMLInputElement>(null);
  const [errorText, setErrorText] = useState('');

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!passwordRef.current || !passwordRef.current.value) return;

    const isMatched = await window.user.verifyPassword(passwordRef.current.value);
    if (isMatched) {
      location.route(previousPath.value);
    }
    else {
      setErrorText('Incorrect password');
    }
  }, [previousPath.value]);

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
          preventPasting
        />
        <CardButtonIcon type='submit' text='verify'/>
      </form>
    </div>
  )
}

export default Authenticate;