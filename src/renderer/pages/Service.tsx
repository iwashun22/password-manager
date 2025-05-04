import { useLocation } from 'preact-iso';
import { useCallback } from 'preact/hooks';
import BackButton from '@/components/BackButton';

function Service() {
  const location = useLocation();
  const navigateHome = useCallback(() => {
    location.route('/');
  }, []);

  return (
    <>
      <BackButton onClick={navigateHome}/>
    </>
  )
}

export default Service;