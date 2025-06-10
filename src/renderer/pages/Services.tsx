import { Router, Route } from 'preact-iso';
import ServicesDashboard from './Service/Dashboard';
import CreateForm from './Service/CreateForm';
import AccountList from './Service/AccountList';
import EditAccountForm from './Service/EditAccountForm';
import EditServiceInfo from './Service/EditServiceInfo';

function Services() {
  return (
    <Router>
      <Route path="/dashboard" component={ServicesDashboard} />
      <Route path="/create" component={CreateForm} />
      <Route path="/edit/account/:id" component={EditAccountForm} />
      <Route path="/edit/service/:id" component={EditServiceInfo} />
      <Route path="/:id" component={AccountList} />
    </Router>
  )
}


export default Services;