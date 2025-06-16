import { useCallback } from 'preact/hooks';
import { signal } from '@preact/signals';
import { DatabaseBackup, FilePlus2 } from 'lucide-preact';
import CardButtonIcon from '../components/CardButtonIcon';
import CreateNew from '../components/CreateNew';
import Backup from '../components/Backup';
import BackButton from '@/components/BackButton';

import './WelcomePage.scss';

const chooseMode = signal<"create"|"backup"|null>(null);

function WelcomePage() {
  const backButtonOnClick = useCallback(() => {
    chooseMode.value = null;
  }, []);

  if (!chooseMode.value) return (
    <SelectMode/>
  )

  switch(chooseMode.value) {
    case 'create':
      return (
        <>
          <BackButton onClick={backButtonOnClick}/>
          <CreateNew afterCreated={backButtonOnClick}/>
        </>
      )
    case 'backup':
      return (
        <>
          <BackButton onClick={backButtonOnClick}/>
          <Backup afterLoaded={backButtonOnClick}/>
        </>
      )
  }
}

function SelectMode() {
  const choose = useCallback((mode: typeof chooseMode.value) =>
    () => {
      chooseMode.value = mode;
    }
  , [])
  return (
    <>
      <header className="page-header">
        <h1>password manager</h1>
        <h3>Welcome to Your Secure Vault!</h3>
      </header>
      <div className="select-mode-container">
        <span>
          <CardButtonIcon
            icon={FilePlus2}
            text="Create New"
            onClick={choose('create')}
            type='card'
          />
        </span>
        <span>
          <CardButtonIcon
            icon={DatabaseBackup}
            text="Backup Data"
            onClick={choose('backup')}
            type='card'
          />
        </span>
      </div>
    </>
  )
}

export default WelcomePage;