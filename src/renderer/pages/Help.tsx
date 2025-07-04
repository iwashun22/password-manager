import { FunctionComponent as FC } from 'preact';
import { useCallback } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import Accordion, { AccordionText as Text, type ColorVariant } from '@/components/Accordion';
import BackButton from '@/components/BackButton';
import Link from '@/components/Link';
import Instagram from '@assets/instagram_icon.svg';
import Discord from '@assets/discord_icon.svg';
import Email from '@assets/email_icon.svg';
import GitHub from '@assets/github_icon.svg';

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
    fc: () =>
      <>
      <Text.Header>Introduction</Text.Header>
      <Text.Paragraph>
        Hello! I'm Shun, the developer behind this application. I originally built this password manager for my own personal use, but I'm excited to share it with you.
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
        Your backup file is highly secure. You can then use this file to retrive your data on any device, as long as you have the recovery key.
      </Text.Paragraph>
      </>
  },
  {
    header: 'How secure is the system?',
    color: 'orange',
    fc: () =>
      <>
      <Text.Header>Stored data</Text.Header>
      <Text.Paragraph>
        Your data is stored with encryption directly on your device. Each device uses a unique encryption key, which significantly increases security.
      </Text.Paragraph>
      <Text.Header>Backup file data</Text.Header>
      <Text.Paragraph>
        The backup file is encrypted using a complex method to derive the encryption key from your recovery key. This means that even if someone gains access to your backup file, they won't be able to read the data without the recovery key.
      </Text.Paragraph>
      <Text.Header>Is hacking possible?</Text.Header>
      <Text.Paragraph>
        While it's unlikely for typical scenarios, no system can offer 100% absolute immunity if a highly motivated attacker gains physical possession of your device or achieves full-control remote access. In such extreme cases, it is possible for them to compromise the data.
        And if the attacker understands the encryption algorithm and logic, they could potentially decrypt the data without the recovery key.
      </Text.Paragraph>
      <Text.Paragraph>
        I discourage you from using this app inside a corporate environment. Because the security of this app is not guaranteed in such environments, and I cannot provide support for it.
      </Text.Paragraph>
      <Text.Paragraph>
        However, for personal use, this system provides a very high level of security that is more than sufficient for most common situations.
      </Text.Paragraph>
      </>
  },
  {
    header: 'What if I forget the password?',
    color: 'purple',
    fc: () => <>
      <Text.Header>Use recovery key</Text.Header>
      <Text.Paragraph>
        If you fail all attempts to enter the password, the text "Forgot the password? Verify via recovery key." will appear at the bottom of the page. After clicking this, you can enter the recovery key to verify your identity and set a new password.
      </Text.Paragraph>
    </>
  },
  {
    header: 'How can I backup the data?',
    color: 'blue',
    fc: () => <>
      <Text.Header>Download File</Text.Header>
      <Text.Paragraph>
        You can download your backup file by clicking the "SAVE BACKUP FILE" button in the settings page. This file contains all your accounts, including the password you set for this app.
      </Text.Paragraph>
      <Text.SubHeader>Note:</Text.SubHeader>
      <Text.Paragraph>
        This file is not updated automatically. You need to download it manually whenever you make changes to your accounts.
      </Text.Paragraph>
      <Text.Header>Load data</Text.Header>
      <Text.Paragraph>
        You can load your backup file at the first time you open the app, or when your data is all empty, along with the recovery key you saved.
      </Text.Paragraph>
      <Text.Paragraph>
        If you still have some data remaining, you won't be able to load the backup file. In that case, you can delete all your data by clicking the "DELETE ALL DATA" button in the settings page, and then load the backup file.
      </Text.Paragraph>
    </>
  },
  {
    header: 'What if I lost the recovery key?',
    color: 'red',
    fc: () => <>
      <Text.Header>What will happen?</Text.Header>
      <Text.Paragraph>
        You can still use the app without any issues, but you won't be able to download your backup file. Crucially, you will lose access to your data if you forget the password.
      </Text.Paragraph>
      <Text.Header>What should I do?</Text.Header>
      <Text.Paragraph>
        I highly recommend that you first save your data elsewhere, and then clear all data by clicking the "DELETE ALL DATA" button in the settings page. After that, you can start fresh with a new recovery key.
      </Text.Paragraph>
      <Text.Paragraph>
        You can then manually insert your accounts one by one.
      </Text.Paragraph>
    </>
  },
  {
    header: 'Contact developer & report bugs',
    fc: () => <>
      <Text.Header>Will the bugs be fixed?</Text.Header>
      <Text.Paragraph>
        This app was built for my personal use, and I haven't encountered any bugs so far. While I don't plan to actively maintain it, I will fix any crucial bugs that I find or that are reported if they impact the app's core functionality. However, I can't guarantee that I'll fix all bugs across every platform.
      </Text.Paragraph>
      <Text.Header>How can I report bugs?</Text.Header>
      <Text.Paragraph>
        If you have a GitHub account, you can report bugs by creating an issue in the <Link
          text="GitHub repository."
          url="https://github.com/iwashun22/password-manager/issues"
        />
      </Text.Paragraph>
      <Text.Paragraph>
        Social media accounts (these are my personal accounts, so please be respectful. I may not respond to all messages):
      </Text.Paragraph>
      <ul style={{ listStyle: 'none', marginTop: '14px' }}>
        <li>
          <Link
            url="https://www.instagram.com/iwashun_05"
            text="@iwashun_05"
            icon={Instagram}
          />
        </li>
        <li>
          <Link
            url="https://discord.com/users/709934504478900278"
            text="shobon_neko2959"
            icon={Discord}
          />
        </li>
        <li>
          <Link
            url="https://github.com/iwashun22"
            text="iwashun22"
            icon={GitHub}
          />
        </li>
        <li>
          <Link
            text="iwashunabc519@gmail.com"
            icon={Email}
          />
        </li>
      </ul>
    </>
  }
]

export default Help;