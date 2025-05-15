import { RefObject } from 'preact';
import { useCallback, useState, useEffect } from 'preact/hooks';
import { KeyboardEvent, MouseEvent } from 'preact/compat';

import './index.scss';

interface Props {
  selectItems: string[],
  inputRef: RefObject<HTMLInputElement>,
  placeholder?: string,
  value?: string,
}

const MAX_SELECT_ITEMS = 5;

function FormInputSelect({ selectItems, inputRef, placeholder = 'select', value = '' }: Props) {
  const [show, setShow] = useState(false);
  const [matched, setMatched] = useState<typeof selectItems>([]);
  const [selectIndex, setSelectIndex] = useState(-1);

  const moveCaretToEnd = useCallback(() => {
    if (!inputRef.current) return;

    const length = inputRef.current.value.length
    inputRef.current.focus();
    requestAnimationFrame(() => {
      inputRef.current?.setSelectionRange(length, length);
    });
  }, []);

  const matchedItems = useCallback(() => {
    const inputValue = inputRef.current?.value || '';

    if (!inputValue) {
      setMatched([]);
    }
    else {
      const regex = new RegExp(`^${inputValue}.+$`, "i");
      const filtered = selectItems.filter(v => regex.test(v));
      setMatched(filtered.slice(0, MAX_SELECT_ITEMS));
    }

    setShow(true);
  }, [selectItems]);

  const keyboardNavigation = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    switch(e.key) {
      case 'ArrowDown':
        moveCaretToEnd();
        setSelectIndex(v => v + 1);
        break;
      case 'ArrowUp':
        moveCaretToEnd();
        if (selectIndex >= 0) {
          setSelectIndex(v => v - 1);
        }
        break;
      default:
        setSelectIndex(-1);
        break;
    }
  }, [selectIndex]);

  const selectHandler = useCallback((str: string) => {
    return (e: MouseEvent<HTMLElement>) => {
      // e.preventDefault();
      if (!inputRef.current) return;

      inputRef.current.value = str;
      moveCaretToEnd();
      setShow(false);
    }
  }, []);

  return (
    <span className="input-wrapper">
      <input
        type="text"
        defaultValue={value}
        ref={inputRef}
        className="form-input"
        placeholder={placeholder}
        onInput={matchedItems}
        onKeyDown={keyboardNavigation}
      />
      {
        show &&
        <div className="select">
          {
            matched.map((v, i) =>
              <button
                key={i}
                data-is-targeted={i === selectIndex ? '' : undefined}
                className="item"
                onClick={selectHandler(v)}
              >
                { v }
              </button>
            )
          }
        </div>
      }
    </span>
  )
}

export default FormInputSelect;