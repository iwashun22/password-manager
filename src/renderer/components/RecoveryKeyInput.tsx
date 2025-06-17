import { useState, useCallback, useRef, useId } from 'preact/hooks';
import { RefObject } from 'preact';
import { ChangeEvent } from 'preact/compat';
import { setError } from './ErrorHandler';

import './RecoveryKeyInput.scss';

interface Props {
  keyInputRef: RefObject<HTMLTextAreaElement>
}

function RecoveryKeyInput({ keyInputRef }: Props) {
  const [keyEmpty, setKeyEmpty] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const id = useId();

  const handleChange = useCallback(() => {
    const value = keyInputRef.current?.value || '';

    setKeyEmpty(!value);
  }, []);

  const onFileUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;

    if (files) {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = async (e) => {
        const recoveryKey = e.target?.result as string || '';

        const validKey = await window.backup.checkKeySize(recoveryKey);
        if (validKey === null) {
          setError('Something went wrong');
          return;
        }

        if (!validKey) {
          setError('Invalid key');
          return;
        }

        keyInputRef.current!.value = recoveryKey;
        setKeyEmpty(!recoveryKey);
        fileRef.current!.value = '';
      }

      reader.readAsText(file);
    }
  }, []);

  return (
    <div className="recovery-key-input-container">
      <textarea 
        ref={keyInputRef}
        placeholder="recovery key"
        onChange={handleChange}
      >
      </textarea>
      {
        keyEmpty &&
        <label className="choose-file-btn" for={id}>
          <span>choose a file</span>
        </label>
      }
      <input
        id={id}
        ref={fileRef}
        type="file"
        className="file-input"
        accept=".txt"
        onChange={onFileUpload}
      />
    </div>
  )
}

export default RecoveryKeyInput;