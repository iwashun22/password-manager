import type { FormEvent, PropsWithChildren, RefObject } from 'preact/compat';
import { useCallback } from 'preact/compat';

import './index.scss';

interface Props {
  onSubmit: (e: FormEvent) => void,
  headerText?: string,
}

function FormContainer(props: PropsWithChildren<Props>) {
  return (
    <span className="inline-block">
      { props.headerText &&
        <div className="header-container">
          <h2 className="form-header">{props.headerText}</h2>
        </div>
      }
      <form onSubmit={props.onSubmit} className="form-container">
        { props.children }
      </form>
    </span>
  )
}

export function ButtonContainer(props: PropsWithChildren) {
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
      { props.children }
    </div>
  )
}

export function LabelText({
  text,
  labelFor
}: {
  text: string,
  labelFor: RefObject<HTMLInputElement | HTMLTextAreaElement>
}) {
  const focus = useCallback(() => {
    labelFor.current?.focus();
  }, []);
  return (
    <label className="label-text" onClick={focus}>
      { text }
    </label>
  )
}

export default FormContainer;