import { Router, Route } from 'preact-iso';
import ServicesDashboard from './Service/Dashboard';
import CreateForm from './Service/CreateForm';
import AccountList from './Service/AccountList';

function Services() {
  return (
    <Router>
      <Route path="/dashboard" component={ServicesDashboard} />
      <Route path="/create" component={CreateForm} />
      <Route path="/:id" component={AccountList} />
    </Router>
  )
}


export default Services;