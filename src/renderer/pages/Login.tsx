import { useEffect } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import { previousPath } from '../components/InactivityHandler';

function Login() {
  useEffect(() => {
    console.log(previousPath.value);
  }, [previousPath.value]);

  return (
    <h2>Login: {previousPath.value}</h2>
  )
}

export default Login;