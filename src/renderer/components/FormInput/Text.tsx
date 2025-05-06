import { RefObject } from 'preact';
import { useState, useCallback, Dispatch } from 'preact/hooks';
import { Eye, EyeClosed } from 'lucide-preact';

import './index.scss';

interface Props {
  inputRef: RefObject<HTMLInputElement>,
  type?: 'text' | 'password',
  placeholder?: string,
  disabled?: boolean,
}

function FormInputText({
  inputRef,
  type = 'text',
  placeholder = 'placeholder',
  disabled = false
}: Props) {
  const isPassword = type === 'password';
  const [visible, setVisible] = useState(false);

  const toggleHandler = useCallback((e: MouseEvent) => {
    e.preventDefault();
    inputRef.current?.focus();
    setVisible(v => !v);

    requestAnimationFrame(() => {
      if (inputRef.current) {
        const value = inputRef.current.value;

        inputRef.current.setSelectionRange(value.length, value.length);
      }
    });
  }, []);

  const hide = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <span className="input-wrapper">
      <input
        type={ isPassword ? (visible ? "text" : "password") : "text" }
        ref={inputRef}
        className="form-input"
        placeholder={placeholder}
        onFocusOut={hide}
        disabled={disabled}
      />
      { isPassword &&
        <span
          className="toggle-visibility"
          onClick={toggleHandler}
          onMouseDown={(e) => e.preventDefault()} // this will prevent to reset the target focus
        >
          {
            visible ?
            <Eye className="icon"/> :
            <EyeClosed className="icon"/>
          }
        </span>
      }
    </span>
  )
}

export default FormInputText;