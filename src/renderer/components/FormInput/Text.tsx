import { RefObject } from 'preact';
import { useState, useCallback } from 'preact/hooks';
import { Eye, EyeClosed } from 'lucide-preact';

import './index.scss';

interface Props {
  inputRef: RefObject<HTMLInputElement>,
  type?: 'text' | 'password' | 'url',
  placeholder?: string,
  disabled?: boolean,
  value?: string,
}

function FormInputText({
  inputRef,
  type = 'text',
  placeholder = 'placeholder',
  disabled = false,
  value = '',
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

  const toLowercase = useCallback(() => {
    if (!inputRef.current) return;

    inputRef.current.value = inputRef.current.value.toLowerCase();
  }, []);

  return (
    <span className="input-wrapper">
      <input
        type={ isPassword ? (visible ? "text" : "password") : "text" }
        ref={inputRef}
        className="form-input"
        placeholder={placeholder}
        onFocusOut={hide}
        defaultValue={value}
        onInput={type === 'url' ? toLowercase : () => {}}
        disabled={disabled}
        data-type-url={type === 'url'}
      />
      { (isPassword && !disabled) &&
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

interface TextAreaProps {
  inputRef: RefObject<HTMLTextAreaElement>
  placeholder?: string,
  value?: string,
}

export function FormTextArea({ inputRef, placeholder = 'description', value = '' }: TextAreaProps) {
  return (
    <span className="form-text-area-wrapper">
      <textarea
        ref={inputRef}
        placeholder={placeholder}
        defaultValue={value}
      >
      </textarea>
    </span>
  )
}

export default FormInputText;