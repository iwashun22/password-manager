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

const MAX_SELECT_ITEMS = 3;

function FormInputSelect({ selectItems, inputRef, placeholder = 'select', value = '' }: Props) {
  const [show, setShow] = useState(false);
  const [matched, setMatched] = useState<typeof selectItems>([]);
  const [range, setRange] = useState<[start: number, end: number]>([0, MAX_SELECT_ITEMS - 1]);
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
      const filtered = selectItems
        .filter(v => regex.test(v))
        .sort((a, b) => a.localeCompare(b));
      setMatched(filtered);
    }

    setRange([0, MAX_SELECT_ITEMS - 1]);
    setShow(true);
  }, [selectItems]);

  const keyboardNavigation = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (!inputRef.current) return;

    switch(e.key) {

      case 'ArrowDown':
        moveCaretToEnd();
        if (selectIndex === matched.length - 1) {
          return;
        }

        if (selectIndex === range[1]) {
          setRange(range.map(r => r + 1) as typeof range);
        }
        setSelectIndex(i => i + 1);
        break;

      case 'ArrowUp':
        moveCaretToEnd();
        if (selectIndex === 0) {
          return;
        }

        if (selectIndex === range[0]) {
          setRange(range.map(r => r - 1) as typeof range);
        }
        setSelectIndex(i => i - 1);
        break;

      case 'Enter':
        if (0 <= selectIndex && selectIndex <= matched.length - 1) {
          inputRef.current.value = matched[selectIndex];
          setShow(false);
        }
        break;

      default:
        setSelectIndex(-1);
        break;
    }
  }, [selectIndex, matched]);

  const selectHandler = useCallback((str: string) => {
    return (e: MouseEvent<HTMLElement>) => {
      e.preventDefault();
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
              <>
              {
                (range[0] <= i && i <= range[1]) &&
                <button
                  key={i}
                  data-is-targeted={i === selectIndex ? '' : undefined}
                  className="item"
                  onClick={selectHandler(v)}
                  >
                  <h3>{ v }</h3>
                </button>
              }
              </>
            )
          }
        </div>
      }
    </span>
  )
}

export default FormInputSelect;