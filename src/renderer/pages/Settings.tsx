import { useLocation } from 'preact-iso';
import { useCallback, useRef, useState } from 'preact/hooks';
import { FormEvent } from 'preact/compat';
import { signal } from '@preact/signals';
import BackButton from '@/components/BackButton';
import Confirmation from '@/components/Confirmation';
import { logoutSignal } from '@/components/InactivityHandler';
import PasswordInput from '@/components/PasswordInput';
import CardButtonIcon from '@/components/CardButtonIcon';
import RecoveryKeyInput from '@/components/RecoveryKeyInput';
import { setError } from '@/components/ErrorHandler';
import { triggerUpdate } from '@/utils/triggers';

import './Settings.scss';

enum ChoseSetting {
  PASSWORD = 1,
  BACKUP,
  DELETE,
}

const choseSettingSignal = signal(0);
type IterateItem = {
  headerText: string,
  mode: ChoseSetting,
  buttonText: string,
  buttonType?: 'danger' | 'normal',
  paragraph?: string,
}

function Settings() {
  const location = useLocation();

  const navigateHome = useCallback(() => {
    location.route('/');
  }, []);
  
  const navigateBackFromSubpage = useCallback(() => {
    choseSettingSignal.value = 0;
  }, []);

  const choseSettingHandler = useCallback((mode: ChoseSetting) => {
    return () => {
      choseSettingSignal.value = mode;

      if (mode === ChoseSetting.DELETE) {
        logoutSignal.value = true;
      }
    }
  }, []);

  const deleteData = useCallback(() => {
    (async () => {
      await window.db.deleteAllData();
      triggerUpdate();
      choseSettingSignal.value = 0;
      location.route('/');
    })();
  }, []);

  switch (choseSettingSignal.value) {
    case ChoseSetting.PASSWORD:
      return (
        <ChangePassword backButtonOnClick={navigateBackFromSubpage}/>
      );
    case ChoseSetting.BACKUP:
      return (
        <Backup backButtonOnClick={navigateBackFromSubpage}/>
      );
    default:
      return (
        <>
          {
            choseSettingSignal.value === ChoseSetting.DELETE &&
            <Confirmation
              onConfirm={deleteData}
              onCancel={() => { choseSettingSignal.value = 0; }}
              type='danger'
            >
              <h3>Are you sure you want to delete all data?</h3>
            </Confirmation>
          }
          <BackButton onClick={navigateHome}/>
          <div className="settings-container">
            {
              ([
                {
                  headerText: 'Password setting',
                  mode: ChoseSetting.PASSWORD,
                  buttonText: 'change password',
                  paragraph: 'Change the password for the lock screen.'
                },
                {
                  headerText: 'Backup',
                  mode: ChoseSetting.BACKUP,
                  buttonText: 'save backup file',
                  paragraph: 'Save the backup file on your local computer. You can then use this file to import backup data, along with the recovery key you saved.'
                },
                {
                  headerText: 'Data removal',
                  mode: ChoseSetting.DELETE,
                  buttonText: 'delete all data',
                  buttonType: 'danger',
                  paragraph: 'Delete all existing data and start fresh.'
                }
              ] as IterateItem[]).map(({ headerText, mode, buttonText, buttonType = 'normal', paragraph = '' }, i) => (
                <div className="setting-block" key={i}>
                  <h3 className="setting-title">{ headerText }</h3>
                  { 
                    !!paragraph &&
                    <p className="paragraph">{ paragraph }</p>
                  }
                  <button
                    className={ buttonType === 'danger' ? "btn delete" : "btn" }
                    onClick={choseSettingHandler(mode)}
                  >
                    { buttonText }
                  </button>
                </div>
              ))
            }
          </div>
        </>
      );
  }
}

interface SettingSubpageProp {
  backButtonOnClick: () => void,
}
function ChangePassword(props: SettingSubpageProp) {
  const currentPasswordRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const passwordConfirmRef = useRef<HTMLInputElement>(null);

  const [currentPasswordErr, setCurrentPasswordErr] = useState('');
  const [newPasswordErr, setNewPasswordErr] = useState('');
  const [confirmationErr, setConfirmationErr] = useState('');

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();

    (async () => {
      const [val_current_pw, val_new_pw, val_confirm_pw] = ([currentPasswordRef, newPasswordRef, passwordConfirmRef]).map(ref => ref.current?.value || '');

      if (!val_current_pw) {
        setCurrentPasswordErr('missing current password');
        return;
      }
      if (!val_new_pw) {
        setNewPasswordErr('missing new password');
        return;
      }
      else if (val_new_pw.length < 4) {
        setNewPasswordErr('must contain at least 4 characters');
        return;
      }
      else if (val_new_pw === val_current_pw) {
        setNewPasswordErr('same as current password');
        return;
      }

      if (val_new_pw !== val_confirm_pw) {
        setConfirmationErr('confirmation password does not match');
        return;
      }

      const correctPassword = await window.user.verifyPassword(val_current_pw);

      if (typeof correctPassword === 'number') {
        logoutSignal.value = true;
        return;
      }

      if (!correctPassword) {
        setCurrentPasswordErr('incorrect password');
        return;
      }

      const info = await window.user.updatePassword(val_new_pw);

      if (info === null) {
        setError('Something went wrong');
        return;
      }

      triggerUpdate();
      props.backButtonOnClick();
    })();
  }, []);

  return (
    <>
      <BackButton onClick={props.backButtonOnClick} />
      <header className="page-header">
        <h2>Set new password</h2>
      </header>
      <form onSubmit={handleSubmit} className="password-form">
        <PasswordInput
          inputRef={currentPasswordRef}
          placeholder='current password'
          errorText={currentPasswordErr}
          setErrorState={setCurrentPasswordErr}
          preventPasting
        />
        <PasswordInput
          inputRef={newPasswordRef}
          placeholder='new password'
          errorText={newPasswordErr}
          setErrorState={setNewPasswordErr}
        />
        <PasswordInput
          inputRef={passwordConfirmRef}
          placeholder='confirmation'
          errorText={confirmationErr}
          setErrorState={setConfirmationErr}
          preventPasting
        />
        <CardButtonIcon
          type='submit'
          text='save'
        />
      </form>
    </>
  );
}

function Backup(props: SettingSubpageProp) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();

    (async () => {
      const recoveryKey = inputRef.current?.value || '';
      if (!recoveryKey) return;

      const validLength = await window.backup.checkKeySize(recoveryKey);

      if (validLength === null) throw new Error('Something went wrong');
      if (!validLength) throw new Error('Invalid key');

      const validRecoveryKey = await window.user.verifyRecoveryKey(recoveryKey);
      if (!validRecoveryKey) throw new Error('Incorrect recovery key');

      const data = await window.backup.getBackupData(recoveryKey);
      if (data === null) throw new Error('Failed to retrieve backup');

      const a = document.createElement('a');
      const blob = new Blob([data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = 'backup-file.txt';
      a.click();
      URL.revokeObjectURL(url);

      props.backButtonOnClick();
    })()
      .catch(err => {
        setError(err.message);
      });
  }, []);

  return (
    <>
      <BackButton onClick={props.backButtonOnClick}/>
      <form onSubmit={handleSubmit}>
        <RecoveryKeyInput
          keyInputRef={inputRef}
        />
        <br/>
        <CardButtonIcon type='submit' text='generate backup' />
      </form>
    </>
  )
}

export default Settings;