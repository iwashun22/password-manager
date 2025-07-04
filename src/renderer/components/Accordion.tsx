import { PropsWithChildren, useCallback, useRef, useState, useEffect } from 'preact/compat';
import { render } from 'preact';
import { ChevronDown, ChevronUp } from 'lucide-preact';

import './Accordion.scss';

export type ColorVariant = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
interface Props {
  headerText: string,
  variant?: ColorVariant
}

function Accordion({ headerText, variant = 'gray', children }: PropsWithChildren<Props>) {
  const ref = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState(0);

  useEffect(() => {
    const parent = ref.current!.parentElement!;

    let max = 0;
    Array.from(parent.children).forEach(element => {
      const accordionBody = element.getElementsByClassName("accordion-body")[0]!;
      if (accordionBody.scrollHeight > max) {
        max = accordionBody.scrollHeight;
      }
    });

    setMaxHeight(max);
  }, []);

  const handleClick = useCallback(() => {
    if (ref.current) {
      const parent = ref.current.parentElement!;

      Array.from(parent.children).forEach(child => {
        if (!child.classList.contains("accordion")) return;

        if (child === ref.current) {
          ref.current.classList.toggle("open");
        } else {
          child.classList.remove("open");
        }

        const button = child.getElementsByClassName("toggle-btn")[0]!;
        render(
          child.classList.contains("open") ?
            <ChevronUp className="icon"/> :
            <ChevronDown className="icon"/>
          , button
        );
      })
    }
  }, []);

  return (
    <div className={`accordion ${variant}`} ref={ref}>
      <div className="accordion-header" onClick={handleClick}>
        <h3 className="text">{ headerText }</h3>
        <button type="button" className="toggle-btn">
          <ChevronDown className="icon" />
        </button>
      </div>
      <div
        className="accordion-body"
        style={{ "--max-height": `${maxHeight}px` }}
      >
        { children }
      </div>
    </div>
  )
}

export const AccordionText = {
  Header: ({ children }: PropsWithChildren) =>
    <h1 className="accordion-body-header">{ children }</h1>,
  SubHeader: ({ children }: PropsWithChildren) =>
    <h3 className="accordion-body-subheader">{ children }</h3>,
  Paragraph: ({ children }: PropsWithChildren) =>
    <p className="accordion-body-paragraph">{ children }</p>
} as const;

export default Accordion;