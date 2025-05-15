import './index.scss';

interface Props {
  text: string,
  onClick: () => void,
}

function FormBackButton({ text, onClick }: Props) {
  return (
    <button type="button" className="form-back" onClick={onClick}>
      { text }
    </button>
  )
}

export default FormBackButton;