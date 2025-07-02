import { LocationProvider, Router, Route } from 'preact-iso';
import InactivityHandler from './components/InactivityHandler';
import LockButton from './components/LockButton';
import ErrorHandler from './components/ErrorHandler';
import SuccessLogHandler from './components/SuccessLogHandler';
import Home from './pages/Home';
import WelcomePage from './pages/WelcomePage';
import ShowRecoveryKey from './pages/ShowRecoveryKey';
import Authenticate from './pages/Authenticate';
import ForceDelete from './pages/ForceDelete';
import Email from './pages/Email';
import Services from './pages/Services';
import Settings from './pages/Settings';
import Help from './pages/Help';
import './app.scss';

export function App() {
  return (
    <LocationProvider>
      <InactivityHandler
        excludePaths={[
          "/welcome",
          "/auth",
          "/force-delete"
        ]}
      />
      <LockButton
        excludePaths={[
          "/welcome",
          "/auth",
          "/force-delete",
          "/recovery-key"
        ]}
      />
      <ErrorHandler />
      <SuccessLogHandler />
      <Router>
        <Route path="/" component={Home} />
        <Route path="/welcome" component={WelcomePage} />
        <Route path="/recovery-key" component={ShowRecoveryKey} />
        <Route path="/auth" component={Authenticate} />
        <Route path="/force-delete" component={ForceDelete} />
        <Route path="/email" component={Email} />
        <Route path="/services/*" component={Services}/>
        <Route path="/settings" component={Settings} />
        <Route path="/help" component={Help} />
        <Route path="*" component={Home} />
      </Router>
    </LocationProvider>
  )
}
