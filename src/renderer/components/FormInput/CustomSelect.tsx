import { RefObject } from 'preact';
import { useCallback, useState } from 'preact/hooks';

import './index.scss';

interface Props {
  selectItems: string[],
  inputRef: RefObject<HTMLInputElement>,
  onInput: () => void,
}

const MAX_SELECT_ITEMS = 5;

function FormInputSelect({ selectItems, inputRef, onInput }: Props) {
  const [show, setShow] = useState(false);

  const showItems = useCallback(() => {
    setShow(true);
  }, []);

  const hideItems = useCallback(() => {
    setShow(false);
  }, []);

  const matchedItems = useCallback(() => {
    // TODO:
    if (!inputRef.current) return;


  }, []);

  return (
    <span className="input-wrapper">
      <input
        type="text"
        ref={inputRef}
        className="form-input"
        onFocus={showItems}
        onFocusOut={hideItems}
        onInput={onInput}
      />
      {
        show &&
        <div className="select">
          <h3>show</h3>
          <h3>show</h3>
          <h3>show</h3>
        </div>
      }
    </span>
  )
}

export default FormInputSelect;