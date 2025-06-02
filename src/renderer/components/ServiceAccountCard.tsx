import { useCallback, useState, useEffect } from 'preact/hooks';
import { setMessage } from './SuccessLogHandler';
import { setError } from './ErrorHandler';
import { setSignalSearchValue, setLastViewedServiceId } from '@/pages/Email';
import { Copy, Eye, EyeClosed } from 'lucide-preact';
import { useLocation } from 'preact-iso';

import './ServiceAccountCard.scss';

function ServiceAccountCard({
  service_id,
  username,
  email_id,
  subaddress,
  encrypted_password,
  oauth_provider,
  password_length
}: ServiceAccountProp) {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');

  const togglePasswordVisibility = useCallback(() => {
    (async () => {
      const decrypted = await window.user.requestDecryptedPassword(encrypted_password, 'get');

      if (decrypted) {
        setShowPassword(prev => !prev);
        setPassword(decrypted);
      }
      else {
        setError('Failed to decrypt password');
        return;
      }
    })();
  }, []);

  useEffect(() => {
    if (!showPassword) {
      setPassword(''); // Clear password when not showing
    }
  }, [showPassword]);

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

  const navigateToEmail = useCallback(() => {
    if (email_id === null) return;

    (async () => {
      const emailData = await window.db.getEmailAccount(email_id);

      if (emailData) {
        setSignalSearchValue(emailData.email);
        setLastViewedServiceId(service_id);
        return null;
      }
      else throw new Error('Email account not found');
    })()
      .then(() => {
        location.route('/email');
      })
      .catch(err => {
        setError(err.message);
      })
  }, []);

  useEffect(() => {
    (async () => {
      if (email_id) { 
        const formattedEmail = await window.user.formattingEmail(email_id, subaddress);
        if (formattedEmail === null) {
          setError('Failed to format email');
          return;
        }
        setEmail(formattedEmail);
      }
    })();
  }, []);

  return (
    <div className="service-account-card">
      {
        !!username && (
          <div className="wrapper">
            <h3>username</h3>
            <p>{ username }</p>
          </div>
        )
      }

      {
        !!email && (
          <div className="wrapper email">
            <h3>email</h3>
            <p onClick={navigateToEmail}>{ email }</p>
            {
              !!oauth_provider &&
              <div className="oauth">
                <span>
                  signed in with <i>{ oauth_provider }</i>
                </span>
              </div>
            }
          </div>
        )
      }

      {
        password_length > 0 && (
          <div className="wrapper password">
            <h3>password</h3>
            <p>
              { 
                showPassword ?
                password : // TODO: decrypt password
                '*'.repeat(password_length)
              }
            </p>
            <div className="password-buttons">
              <button className="toggle" onClick={togglePasswordVisibility}>
                { showPassword ? 
                  <Eye className="icon"/> :
                  <EyeClosed className="icon"/>
                }
              </button>
              <button className="copy" onClick={copyToClipboard}>
                <Copy className="icon"/>
              </button>
            </div>
          </div>
        )
      }

      <div className="button-container">
        <button
          className="btn edit"
          disabled={!!oauth_provider}
        >
          edit
        </button>
        <button className="btn delete">delete</button>
      </div>
    </div>
  )
}

export default ServiceAccountCard;