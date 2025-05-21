import { useCallback, useId, type Dispatch, PropsWithChildren } from 'preact/compat';
import { type StateUpdater } from 'preact/hooks';

import './Switch.scss';

interface Props {
  state: boolean,
  setState: Dispatch<StateUpdater<boolean>>
}

function Switch({ state, setState, children }: PropsWithChildren<Props>) {
  const ID = useId();

  const toggle = useCallback(() => {
    setState(v => !v);
  }, []);

  return (
    <label htmlFor={ID} className="switch">
      <input type="checkbox" id={ID} checked={state} onChange={toggle}/>
      <span className="slider"></span>
      <span className="text">{ children }</span>
    </label>
  )
}

export default Switch;