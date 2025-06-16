import { useState, useEffect, useCallback, useId, type RefObject } from 'preact/compat';
import { DragEvent, ChangeEvent } from 'preact/compat';
import { setError } from './ErrorHandler';
import { Upload, CircleX, FileText } from 'lucide-preact';

import './FileDragInput.scss';

interface Props {
  fileRef: RefObject<HTMLInputElement>,
}

function FileDragInput({ fileRef }: Props) {
  const [uploaded, setUploaded] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const id = useId();

  const preventDefault = useCallback((e: DragEvent<HTMLDivElement>) => {
    if (uploaded) return;
    e.preventDefault();
    e.stopPropagation();
  }, [uploaded]);

  const updateFile = useCallback((files: FileList) => {
    if (files.length != 1) {
      setError('Cannot drop multiple files');
      return;
    }

    const file = files[0];
    const txtRegExp = /.txt/;

    if (!txtRegExp.test(file.name)) {
      setError('Unsupported file extension');
      return;
    }

    fileRef.current!.files = files;
    setFile(files[0]);
    setUploaded(true);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer?.files;

    if (files) {
      updateFile(files);
    }
  }, []);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;

    if (files) {
      updateFile(files);
    }
  }, []);

  const removeFile = useCallback(() => {
    if (!fileRef.current) return;

    fileRef.current!.value = '';
    setFile(null);
    setUploaded(false);
  }, []);

  return (
    <div
      className="dragable-area"
      onDrag={preventDefault}
      onDragOver={preventDefault}
      onDragStart={preventDefault}
      onDragEnd={preventDefault}
      onDrop={handleDrop}
    >
      {
        uploaded ?
        <UploadedFile file={file} onRemove={removeFile} /> :
        <>
        <div className="icon-container">
          <Upload className="icon"/>
        </div>
        <h2>Drag & drop backup file here</h2>
        <label className="label" for={id}>
          <span className="text">or <i className="highlight">browse file</i> from device</span>
        </label>
        </>
      }
      <input
        id={id}
        className="file-input"
        type="file"
        accept=".txt"
        onChange={handleChange}
        ref={fileRef}
      />
    </div>
  )
}

function UploadedFile({ file, onRemove }: {
  file: File | null,
  onRemove?: () => void,
}) {
  const [size, setSize] = useState('');

  useEffect(() => {
    if (file) {
      const KB = (file.size / 1024).toFixed(1);
      setSize(KB);
    }
  }, [file]);

  if (!file) return null;

  return (
    <div className="file-container">
      <FileText className="file-icon"/>
      <div className="file-info">
        <h2 className="filename">{ file.name }</h2>
        <p className="filesize">{ size }KB</p>
      </div>
      <button 
        className="remove-file-btn"
        type="button"
        onClick={onRemove}
      >
        <CircleX className="icon"/>
      </button>
    </div>
  )
}

export default FileDragInput;