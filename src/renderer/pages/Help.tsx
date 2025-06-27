import { FunctionComponent as FC } from 'preact';
import { useCallback } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import Accordion, { AccordionText as Text, type ColorVariant } from '@/components/Accordion';
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
            variant={prop.color || 'blue'}
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
    fc: () =>
      <>
      <Text.Header>Introduction</Text.Header>
      <Text.Paragraph>
        Hello! I'm Shun Iwashita, the developer behind this application. I originally built this password manager for my own personal use, but I'm excited to share it with you.
      </Text.Paragraph>
      <Text.Paragraph>
        You'll find many password managers available today, but I designed this one with a key difference: your data stays entirely on your local machine. There's no need for an account, and your information is never sent to servers or the cloud. All you need is a recovery key, and you'll manage your backups manually through a file.
      </Text.Paragraph>
      <Text.Header>Features</Text.Header>
      <Text.SubHeader>Simple user interface</Text.SubHeader>
      <Text.Paragraph>
        This app offers a clean, organized, and user-friendly interface. You can easily copy or modify your passwords whenever you need to.
      </Text.Paragraph>
      <Text.SubHeader>Email Sub-addressing Support</Text.SubHeader>
      <Text.Paragraph>
        You can add service accounts using email sub-addressing (e.g., example+subaddress@gmail.com), and each one will be treated as a unique account.
      </Text.Paragraph>
      <Text.SubHeader>Encrypted file backup</Text.SubHeader>
      <Text.Paragraph>
        Your backup file is highly secure. Even if the file is compromised or falls into the wrong hands, it's nearly impossible for anyone to crack the encryption without your recovery key.
      </Text.Paragraph>
      </>
  },
  {
    header: 'How secure is the system?',
    fc: () =>
      <>
      <Text.Header>Stored data</Text.Header>
      <Text.Paragraph>
        Your data is stored with encryption directly on your device. Each device uses a unique encryption key, which significantly increases security by making it difficult for unauthorized parties to obtain your key.
      </Text.Paragraph>
      <Text.Header>Is hacking possible?</Text.Header>
      <Text.Paragraph>
        While it's highly unlikely for typical scenarios, no system can offer 100% absolute immunity if a highly motivated attacker gains physical possession of your device or achieves full-control remote access. In such extreme cases, it might be theoretically possible for them to compromise the data.
      </Text.Paragraph>
      <Text.Paragraph>
        However, for personal use, this system provides a very high level of security that is more than sufficient for most common situations.
      </Text.Paragraph>
      </>
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
  },
  {
    header: 'Contact developer & report bugs',
    fc: () => <></>
  }
]

export default Help;