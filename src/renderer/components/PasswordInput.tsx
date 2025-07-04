import { MouseEvent, RefObject, FocusEvent, Dispatch, ChangeEvent } from 'preact/compat';
import { useState, useCallback, type StateUpdater } from 'preact/hooks';
import { Eye, EyeClosed } from 'lucide-preact';

import './PasswordInput.scss';

interface Props {
  inputRef: RefObject<HTMLInputElement>
  placeholder?: string,
  preventPasting?: boolean,
  errorText?: string,
  setErrorState?: Dispatch<StateUpdater<string>> | undefined
  disabled?: boolean,
}

function PasswordInput({
  inputRef,
  placeholder = 'password',
  preventPasting = false,
  errorText = '',
  setErrorState = undefined,
  disabled = false,
}: Props) {
  const [isVisible, setIsVisible] = useState(false);

  const moveCaretToEnd = useCallback(() => {
    const input = inputRef.current as HTMLInputElement;
    const length = input.value.length;
    input.setSelectionRange(length, length);
  }, []);

  const removeErrorTextOnChange = useCallback((_e: ChangeEvent<HTMLInputElement>) => {
    if (setErrorState === undefined) return;
    setErrorState('');
  }, [])

  const hideOnFocusOut = useCallback((_e: FocusEvent<HTMLInputElement>) => {
    setIsVisible(false);
  }, []);

  const preventBlur = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  }, []);

  const handleToggle = useCallback((_e: MouseEvent<HTMLButtonElement>) => {
    setIsVisible(!isVisible);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      moveCaretToEnd();
    });
  }, [isVisible]);

  return (
    <span className="input-box">
      <input
        type={isVisible ? "text" : "password"}
        placeholder={placeholder}
        ref={inputRef}
        onInput={removeErrorTextOnChange}
        onFocusOut={hideOnFocusOut}
        onPaste={ preventPasting ? (e) => e.preventDefault() : undefined }
        disabled={disabled}
      />
      <button
        type="button"
        className="toggle-visibility-btn"
        onMouseDown={preventBlur}
        onClick={handleToggle}
      >
        {
          isVisible ?
            <Eye/> :
            <EyeClosed/>
        }
      </button>
      {
        errorText &&
        <span className="error-text">{errorText}</span>
      }
    </span>
  )
}

export default PasswordInput;