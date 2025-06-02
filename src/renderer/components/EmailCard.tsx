import { useState, useEffect, useCallback, useRef } from 'preact/hooks';
import { Eye, EyeClosed, Copy, SquarePen, Trash, X, Check } from 'lucide-preact';
import Confirmation from './Confirmation';
import Toast from './Toast';
import { triggerUpdate } from '@/utils/triggers';
import { logoutSignal } from './InactivityHandler';
import FormInputText from './FormInput/Text';
import { signal } from '@preact/signals';
import { setMessage } from './SuccessLogHandler';
import { setError } from './ErrorHandler';

import './EmailCard.scss';

const authenticatedBeforeModify = signal(-1);

function EmailCard({ id, email, encrypted_password, password_length }: EmailProp) {
  const [decrypted, setDecrypted] = useState('');
  const [visible, setVisible] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const copyToClipboard = useCallback(() => {
    (async () => {
      const success = await window.user.requestDecryptedPassword(encrypted_password, 'copy');

      if (success) {
        setMessage('Password copied to clipboard');
      }
      else {
        setError('Failed to copy password to clipboard');
      }
    })();
  }, []);

  const showPassword = useCallback(() => {
    (async () => {
      const decryptedPassword = await window.user.requestDecryptedPassword(encrypted_password, 'get');

      if (decryptedPassword) {
        setVisible(v => !v);
        setDecrypted(decryptedPassword);
      }
      else {
        setError('Failed to decrypt password');
        return;
      }
    })();
  }, []);

  const openConfirmation = useCallback(() => {
    setShowConfirmation(true);
  }, []);

  const authenticateBeforeEdit = useCallback(() => {
    const authenticatedIndex = authenticatedBeforeModify.value;
    if (authenticatedIndex < 0 || authenticatedIndex !== id) {
      authenticatedBeforeModify.value = id;
      logoutSignal.value = true;
    }
    else {
      authenticatedBeforeModify.value = id;
      console.log('authenticated');
    }
  }, []);

  const deleteEmail = useCallback(() => {
    function unexpectedError() {
      setError('Some thing went wrong');
    }

    (async () => {
      setShowConfirmation(false);
      const servicesWithThisEmail = await window.db.getServiceAccountsLinkedToEmail(id);

      if (servicesWithThisEmail === null) {
        unexpectedError();
        return;
      }
      else if (servicesWithThisEmail.length > 0) {
        setError('Some services are using this email');
        return;
      }

      const info = await window.db.deleteEmailAccount(id);
      if (info === null) {
        unexpectedError();
        return;
      }

      // console.log(info);
      triggerUpdate();
    })();
  }, []);

  useEffect(() => {
    if (!visible) {
      setDecrypted(''); // Clear decrypted password when not visible
    }
  }, [visible]);

  if (authenticatedBeforeModify.value === id) return (
    <ModifyCard
      id={id}
      email={email}
      encrypted_password={encrypted_password}
    />
  )

  return (
    <>
    {
      showConfirmation &&
      <Confirmation
        onConfirm={deleteEmail}
        onCancel={() => setShowConfirmation(false)}
        type='danger'
      >
        <h3>Are you sure you want to delete this email?</h3>
      </Confirmation>
    }
    <div className="email-card-container">
      <div className="email">
        <p>Email:</p>
        <h3>{ email }</h3>
      </div>
      <div className="password">
        <p>Password:</p>
        <h4>
          {
            visible ?
            decrypted
            :
            '*'.repeat(password_length)
          }
        </h4>
        <div className="buttons-container">
          <button onClick={showPassword}>
            {
              visible ?
              <Eye className="icon"/>
              :
              <EyeClosed className="icon"/>
            }
          </button>
          <button onClick={copyToClipboard}>
            <Copy className="icon"/>
          </button>
        </div>
      </div>
      <div className="modification-button">
        <button onClick={authenticateBeforeEdit}>
          <SquarePen className="icon edit"/>
        </button>
        <button onClick={openConfirmation}>
          <Trash className="icon delete"/>
        </button>
      </div>
    </div>
    </>
  )
}

function ModifyCard({ id, email, encrypted_password }: Omit<EmailProp, 'password_length'>) {
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const [previousPassword, setPreviousPassword] = useState('');

  useEffect(() => {
    (async () => {
      try {
        if (newPasswordRef.current) {
          const decrypted = await window.user.requestDecryptedPassword(encrypted_password, 'get') as string;
          newPasswordRef.current.value = decrypted;
          setPreviousPassword(decrypted);
        }
      }
      catch(err) {
        console.error(err);
      }
    })();
  }, []);

  const updatePassword = useCallback(() => {
    // TODO:
    (async () => {
      if (!newPasswordRef.current) return;

      if (previousPassword === newPasswordRef.current.value) return;

      try {
        const info = await window.db.editEmailAccount(id, newPasswordRef.current.value);
        console.log(info);
        authenticatedBeforeModify.value = -1;
        triggerUpdate();
      }
      catch (err) {
        console.log(err);
      }
    })();
  }, [previousPassword]);

  return (
    <>
    <div className="email-card-container">
      <div className="email">
        <p>Email:</p>
        <h3>{ email }</h3>
      </div>
      <div className="password">
        <p>New Password:</p>
        <span className="password-edit-container">
          <FormInputText
            inputRef={newPasswordRef}
            type="password"
          />
        </span>
      </div>
      <div className="modification-button">
        <button
          className="discard"
          onClick={() => { authenticatedBeforeModify.value = -1; }}
        >
          <X className="icon"/>
        </button>
        <button
          className="proceed"
          onClick={updatePassword}
        >
          <Check className="icon"/>
        </button>
      </div>
    </div>
    </>
  )
}

export default EmailCard;