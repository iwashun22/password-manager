import './Loading.scss';

interface Props {
  max: number,
  now: number,
}

function Loading({ max, now }: Props) {
  return (
    <div className="loading">
      <p className="load-text">loading... <i>{ ((now / max) * 100).toFixed(1) }%</i></p>
      <div className="load-bar">
        <span className="bar fill" style={{flex: now / max}}></span>
        <span className="bar empty" style={{flex: (max - now) / max}}></span>
      </div>
    </div>
  )
}

export default Loading;