import { useRef, useCallback, useState } from 'preact/hooks';
import { FormEvent } from 'preact/compat';
import { setError } from './ErrorHandler';
import { setMessage } from './SuccessLogHandler';
import { useLocation } from 'preact-iso';
import FileDragInput from './FileDragInput';
import RecoveryKeyInput from './RecoveryKeyInput';
import CardButtonIcon from './CardButtonIcon';
import Loading from './Loading';
import { triggerUpdate } from '@/utils/triggers';

import './Backup.scss';

interface Props {
  afterLoaded: () => void,
}

function Backup(props: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const recoveryKeyRef = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState(false);
  const [loadCount, setLoadCount] = useState(0);
  const [maxLoad, setMaxLoad] = useState(0);
  const location = useLocation();

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();

    const inputFile = fileRef.current?.files![0] || null;
    const recoveryKey = recoveryKeyRef.current?.value || '';

    if (!inputFile) {
      setError('No file was provided');
      return;
    }
    if (!recoveryKey) {
      setError('No recovery key was provided');
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const fileContent = e.target?.result as string || '';

      if (!fileContent) {
        setError('The file is empty');
        return;
      }

      setLoading(true);
      readBackupHandler(fileContent, recoveryKey);
    }
    reader.readAsText(inputFile);
  }, []);

  const readBackupHandler = useCallback((fileContent: string, recoveryKey: string) => {
    (async () => {
      const validKey = await window.backup.checkKeySize(recoveryKey);

      if (validKey === null) throw new Error('Something went wrong');
      if (!validKey) throw new Error('Invalid key');

      const jsonArray = await window.backup.loadBackupData(fileContent, recoveryKey);
      if (jsonArray === null) {
        window.db.deleteAllData().then(() => {
          triggerUpdate();
        });
        throw new Error('Failed backing up data');
      }

      setMaxLoad(jsonArray.length);
      loadEachService(jsonArray);
    })()
      .catch(err => {
        setLoading(false);
        setError(err.message);
      });
  }, []);

  const loadEachService = useCallback((json: Array<object>) => {
    if (json.length === 0) {
      props.afterLoaded();
      triggerUpdate();
      setLoading(false);
      setMessage('Backup complete!');
      location.route('/');
      return;
    }

    window.backup.loadEachService(json.shift()!)
      .then(succeed => {
        setLoadCount(v => v + 1);
        if (!succeed) {
          setError('Failed to backup some accounts');
        }
      })
      .catch(err => {
        setError('Failed to backup a service');
      })
      .finally(() => {
        setTimeout(() => {
          loadEachService(json);
        }, 100);
      })
  }, []);

  if (loading) return (
    <Loading max={maxLoad} now={loadCount} />
  )

  return (
    <form onSubmit={handleSubmit} className="flex-container">
      <FileDragInput fileRef={fileRef} />
      <br />
      <RecoveryKeyInput keyInputRef={recoveryKeyRef}/>
      <br />
      <CardButtonIcon type='submit' text='proceed' />
    </form>
  )
}

export default Backup;