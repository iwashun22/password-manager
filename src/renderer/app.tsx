import { useState, useEffect } from 'preact/hooks';
import WelcomePage from './components/WelcomePage';
import './app.scss';

export function App() {
  const [loading, setLoading] = useState(true);
  const [requireNewPassword, setRequireNewPassword] = useState(false);

  useEffect(() => {
    (async() => {
      const data = await window.user.getSystemPassword();
      if (!data) {
        setRequireNewPassword(true);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <h1>Loading</h1>
  }

  if (!loading && requireNewPassword) {
    return <WelcomePage/>
  }

  return (
    <h1>Hello world</h1>
  )
}
