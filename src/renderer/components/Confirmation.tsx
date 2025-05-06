import { PropsWithChildren } from 'preact/compat';
import { createPortal } from 'preact/compat';

import './Confirmation.scss';

interface Props {
  onConfirm: () => void,
  onCancel: () => void,
  type?: "normal" | "danger"
}

function Confirmation({
  onConfirm,
  onCancel,
  type = 'normal',
  children
}: PropsWithChildren<Props>) {
  return createPortal(
    <div className="dark-filter">
      <span className={`alert-box ${type}`}>
        <div className="main">
          { children }
        </div>
        <div className="button-container">
          <button className="cancel" onClick={onCancel}>
            cancel
          </button>
          <button className="confirm" onClick={onConfirm}>
            okay
          </button>
        </div>
      </span>
    </div>,
    document.getElementById("portal-root")!
  )
}

export default Confirmation;