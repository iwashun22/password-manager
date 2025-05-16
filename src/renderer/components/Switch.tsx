import { useCallback, useRef, type Dispatch, PropsWithChildren } from 'preact/compat';
import { type StateUpdater } from 'preact/hooks';

import './Switch.scss';

interface Props {
  state: boolean,
  setState: Dispatch<StateUpdater<boolean>>
}

function Switch({ state, setState, children }: PropsWithChildren<Props>) {
  const ID = useRef(Math.random().toString(16).split('.')[1]);

  const toggle = useCallback(() => {
    setState(v => !v);
  }, []);

  return (
    <label htmlFor={ID.current} className="switch">
      <input type="checkbox" id={ID.current} checked={state} onChange={toggle}/>
      <span className="slider"></span>
      <span className="text">{ children }</span>
    </label>
  )
}

export default Switch;