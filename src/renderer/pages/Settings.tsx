import { useLocation } from 'preact-iso';
import { useCallback, useState } from 'preact/hooks';
import { signal } from '@preact/signals';
import BackButton from '@/components/BackButton';
import Confirmation from '@/components/Confirmation';
import { logoutSignal } from '@/components/InactivityHandler';

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

      if (mode === ChoseSetting.BACKUP) {
        // TODO:
        return;
      }
      else if (mode === ChoseSetting.DELETE) {
        logoutSignal.value = true;
      }
    }
  }, []);

  const deleteData = useCallback(() => {
    // window.db.deleteAllData();
  }, []);

  switch (choseSettingSignal.value) {
    case ChoseSetting.PASSWORD:
      return (
        <ChangePassword backButtonOnClick={navigateBackFromSubpage}/>
      );
    default:
      return (
        <>
          {
            choseSettingSignal.value === ChoseSetting.DELETE &&
            <Confirmation
              onConfirm={() => {}}
              onCancel={() => { choseSettingSignal.value = 0; }}
              type='danger'
            >
              <h3>Are you sure you want to delete all the data?</h3>
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
  return (
    <>
      <BackButton onClick={props.backButtonOnClick} />
      <h1>password</h1>
    </>
  );
}

export default Settings;