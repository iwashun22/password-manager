import { FormEvent, PropsWithChildren } from 'preact/compat';

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

export default FormContainer;