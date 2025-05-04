import { useLocation } from 'preact-iso';
import { useCallback } from 'preact/hooks';
import BackButton from '@/components/BackButton';

function Settings() {
  const location = useLocation();
  const navigateHome = useCallback(() => {
    location.route('/');
  }, []);

  // TODO: CHANGE PASSWORD
  // TODO: CREATE BACKUP
  // TODO: DELETE DATA

  return (
    <>
      <BackButton onClick={navigateHome}/>
    </>
  )
}

export default Settings;