import { useCallback } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import BackButton from '@/components/BackButton';

function NotFound() {
  const location = useLocation();

  const backButtonClick = useCallback(() => {
    location.route('/');
  }, []);

  return (
    <>
      <BackButton onClick={backButtonClick} />
      <h2 style={{ fontSize: '30px' }}>Page not found</h2>
    </>
  )
}

export default NotFound;