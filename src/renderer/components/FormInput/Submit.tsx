import './index.scss';

interface Props {
  text: string,
}

function FormInputSubmit({ text }: Props) {
  return (
    <button type="submit" className="form-submit">
      { text }
    </button>
  )
}

export default FormInputSubmit;