import { FunctionComponent as FC } from 'preact';
import { useCallback } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import Accordion, { type ColorVariant } from '@/components/Accordion';
import BackButton from '@/components/BackButton';

function Help() {
  const location = useLocation();

  const navigateHome = useCallback(() => {
    location.route('/');
  }, []);

  return (
    <>
      <BackButton onClick={navigateHome} />
      <div className="container" style={{height: '75vh'}}>
        <div style={{ display: 'inline-block' }}>
        {
          data.map((prop, i) => (
            <Accordion
            headerText={prop.header}
            key={i}
            variant={prop.color || 'gray'}
            >
              <prop.fc />
            </Accordion>
          ))
        }
        </div>
      </div>
    </>
  )
}

const data: Array<{ header: string, fc: FC, color?: ColorVariant }> = [
  {
    header: 'About this app',
    fc: () => <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione suscipit, unde in commodi odio iusto dignissimos dolores architecto, hic sed natus, rerum neque iste accusamus sequi. Iure labore totam ullam.</p>
  },
  {
    header: 'How secure is this app?',
    fc: () => <p>Hello world</p>
  },
  {
    header: 'long text',
    fc: () => <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Omnis quod ipsa veritatis nam at vero modi. Nihil ad obcaecati iure magni, accusamus sint earum optio, reprehenderit dolorum est culpa officiis. Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa aspernatur maiores veniam? Repellendus nemo, dolorum odio optio molestias pariatur laudantium quisquam eveniet sequi esse eaque doloribus, cupiditate voluptates eos expedita? Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusamus, atque suscipit dicta alias incidunt expedita quos magni voluptatibus quasi ipsam neque vel saepe autem! Rerum distinctio eos mollitia incidunt enim!</p>
  },
  {
    header: 'What if I forget the password?',
    fc: () => <p>hello</p>
  },
  {
    header: 'How can I backup the data?',
    fc: () => <p>hello</p>
  },
  {
    header: 'What if I lost the recovery key?',
    fc: () => <p>hello</p>
  }
]

export default Help;