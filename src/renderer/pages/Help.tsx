import { FunctionComponent as FC } from 'preact';
import { useCallback } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import Accordion from '@/components/Accordion';
import BackButton from '@/components/BackButton';


function Help() {
  const location = useLocation();

  const navigateHome = useCallback(() => {
    location.route('/');
  }, []);

  return (
    <div className="container">
      <BackButton onClick={navigateHome} />
      {
        data.map((prop, i) => (
          <Accordion
            headerText={prop.header}
            key={i}
          >
            <prop.fc />
          </Accordion>
        ))
      }
    </div>
  )
}

const data: Array<{ header: string, fc: FC }> = [
  {
    header: 'Hello',
    fc: () => <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione suscipit, unde in commodi odio iusto dignissimos dolores architecto, hic sed natus, rerum neque iste accusamus sequi. Iure labore totam ullam.</p>
  },
  {
    header: 'bruh',
    fc: () => <p>Hello world</p>
  }
]

export default Help;