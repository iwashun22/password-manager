import { LocationProvider, Router, Route } from 'preact-iso';
import InactivityHandler from './components/InactivityHandler';
import Home from './pages/Home';
import WelcomePage from './pages/WelcomePage';
import Login from './pages/Login';
import './app.scss';

export function App() {
  return (
    <LocationProvider>
      <InactivityHandler excludePaths={["/welcome", "/login"]}/>
      <Router>
        <Route path="/" component={Home} />
        <Route path="/welcome" component={WelcomePage} />
        <Route path="/login" component={Login} />
      </Router>
    </LocationProvider>
  )
}
