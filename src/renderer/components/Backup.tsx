import { useRef, useCallback } from 'preact/hooks';
import { FormEvent } from 'preact/compat';
import { setError } from './ErrorHandler';
import FileDragInput from './FileDragInput';

import './Backup.scss';

interface Props {
  afterLoaded: () => void,
}

function Backup(props: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const recoveryKeyRef = useRef<HTMLInputElement>(null);

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
      const fileContent = e.target?.result || '';

      if (!fileContent) {
        setError('The file is empty');
        return;
      }

      console.log(fileContent);
    }
    reader.readAsText(inputFile);
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <FileDragInput fileRef={fileRef} />
      <input
        type="text"
        ref={recoveryKeyRef}
      />
      <input type="submit" value="proceed" />
    </form>
  )
}

export default Backup;