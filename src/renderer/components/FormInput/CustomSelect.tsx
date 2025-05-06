import { RefObject } from 'preact';

import './index.scss';

interface Props {
  selectItems: string[],
  inputRef: RefObject<HTMLInputElement>
}

function FormInputSelect({ selectItems, inputRef }: Props) {
  return (
    <span className="input-wrapper">
      <input type="text" ref={inputRef} className="form-input"/>
    </span>
  )
}

export default FormInputSelect;