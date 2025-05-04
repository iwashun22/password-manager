import type { LucideIcon } from 'lucide-preact';

import './CardButtonIcon.scss';

interface Props {
  icon: LucideIcon,
  text: string,
  onClick: () => void,
  type: "card" | "main"
}

interface SubmitProps extends Omit<Props, 'onClick' | 'type' | 'icon'> {
  type: "submit"
}

function CardButtonIcon(props: Props | SubmitProps) {

  if (props.type === 'card') return (
    <span className="card-button btn" onClick={props.onClick}>
      <props.icon display="block" className="icon"/>
      <p className="button-text fw-bold">{ props.text }</p>
    </span>
  )

  if (props.type === 'submit') return (
    <button className="submit-button" type="submit">
      <span>
        <p className="button-text fw-bold">{ props.text }</p>
      </span>
    </button>
  )

  return (
    <span className="main-button btn" onClick={props.onClick}>
      <props.icon display="block" className="icon"/>
      <p className="button-text fw-bold">{ props.text }</p>
    </span>
  )
}

export default CardButtonIcon;