import { useLocation } from 'preact-iso';
import { useCallback } from 'preact/hooks';
import CardButtonIcon from '@/components/CardButtonIcon';
import { Mail, UserRound, Settings, HelpCircle, type LucideIcon } from 'lucide-preact';

type Button = [
  text: string,
  url: string,
  icon: LucideIcon,
]

const items: Array<Button> = [
  ['email accounts', '/email', Mail],
  ['service accounts', '/services/dashboard', UserRound],
  ['settings', '/settings', Settings],
  ['help', '/help', HelpCircle],
]

function Home() {
  const location = useLocation();
  const navigateUrl = useCallback((url: string) => () => {
    location.route(url);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {
        items.map(([text, url, Icon], i) => (
          <span style={{ margin: '5px' }} key={i}>
            <CardButtonIcon
              text={text}
              icon={Icon}
              onClick={navigateUrl(url)}
              type='main'
            />
          </span>
        ))
      }
    </div>
  )
}

export default Home;