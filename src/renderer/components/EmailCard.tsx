import { useState, useEffect, useCallback } from 'preact/hooks';
import { Eye, EyeClosed, Copy, SquarePen, Trash } from 'lucide-preact';
import Confirmation from './Confirmation';
import Toast from './Toast';
import { triggerUpdate } from '@/utils/triggers';

import './EmailCard.scss';

function EmailCard({ id, email, encrypted_password, password_length }: EmailProp) {
  const [decrypted, setDecrypted] = useState('');
  const [visible, setVisible] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState(false);

  const copyToClipboard = useCallback(() => {
    (async () => {
      const success = await window.user.requestDecryptedPassword(encrypted_password, 'copy');

      if (success) {
        setToastMessage('copied to the clipboard');
        setError(false);
        setShowToast(true);
      }
      else {
        setToastMessage('failed to copy');
        setError(true);
        setShowToast(true);
      }
    })();
  }, []);

  const showPassword = useCallback(() => {
    setVisible(v => !v);
  }, []);

  const openConfirmation = useCallback(() => {
    setShowConfirmation(true);
  }, []);

  const deleteEmail = useCallback(() => {
    function unexpectedError() {
      setError(true);
      setShowToast(true);
      setToastMessage('Some thing went wrong');
    }

    (async () => {
      setShowConfirmation(false);
      const servicesWithThisEmail = await window.db.getAllServiceAccounts(id);

      if (servicesWithThisEmail === null) {
        unexpectedError();
        return;
      }
      else if (servicesWithThisEmail.length > 0) {
        setError(true);
        setShowToast(true);
        setToastMessage('Some services are using this email');
        return;
      }

      const info = await window.db.deleteEmailAccount(id);
      if (info === null) {
        unexpectedError();
        return;
      }

      console.log(info);
      triggerUpdate();
    })();
  }, []);

  useEffect(() => {
    if (visible) {
      (async () => {
        const decrypted = await window.user.requestDecryptedPassword(encrypted_password, 'get');

        if (!decrypted) {
          setToastMessage('failed to decrypt password');
          setError(true);
          setShowToast(true);
          setDecrypted('?'.repeat(password_length));
        }
        else {
          setDecrypted(decrypted);
        }
      })()
    }
    else {
      setDecrypted('');
    }

    return () => {
      setDecrypted('');
    }
  }, [visible]);

  return (
    <>
    {
      showToast &&
      <Toast
        message={toastMessage}
        onClose={() => setShowToast(false)}
        variant={error ? 'error' : 'success'}
      />
    }
    {
      showConfirmation &&
      <Confirmation
        onConfirm={deleteEmail}
        onCancel={() => setShowConfirmation(false)}
        type='danger'
      >
        <h2>Hello world</h2>
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
        <button>
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

export default EmailCard;