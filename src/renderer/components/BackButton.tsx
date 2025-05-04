import { createPortal } from 'preact/compat';
import { Undo2 } from 'lucide-preact';

import './BackButton.scss';

interface Props {
  onClick: () => void,
}

function BackButton({ onClick }: Props) {
  return createPortal(
    <button onClick={onClick} className="back-btn">
      <Undo2 className="icon"/>
    </button>,
    document.getElementById("portal-root")!
  );
}

export default BackButton;