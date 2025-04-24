import { useLocation } from 'preact-iso';
import { useState, useEffect } from 'preact/hooks';

function Home() {
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    (async() => {
      const data = await window.user.getSystemPassword();
      if (!data) {
        location.route('/welcome');
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <h1>Loading</h1>
  }

  return (
    <h2>Home</h2>
  )
}

export default Home;