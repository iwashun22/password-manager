import { useCallback } from 'preact/hooks';
import { setError } from './ErrorHandler';
import { setMessage } from './SuccessLogHandler';

import './Link.scss';

interface Props {
  text: string;
  url?: string;
  icon?: string;
}

function Link({
  text,
  url = '',
  icon = undefined
}: Props) {
  const openLink = useCallback(() => {
    if (!url) return;

    (async () => {
      const result = await window.user.openExternalLink(url);
      if (result === false) {
        setError('Failed to open link');
      }
    })();
  }, []);

  const copyUsername = useCallback(() => {
    navigator.clipboard.writeText(text);
    setMessage('Copied to the clipboard!');
  }, [text]);

  if (icon) return (
    <div className="icon-link">
      <button type="button" className="link icon" onClick={openLink}>
        <img src={icon} alt="social media icon" className="icon-img" />
      </button>
      <span className="text" onClick={copyUsername}>{ text }</span>
    </div>
  )

  return (
    <button type="button" className="link" onClick={openLink}>
      <span className="text">{ text }</span>
    </button>
  )
}

export default Link;