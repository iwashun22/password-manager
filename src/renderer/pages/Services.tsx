import { Router, Route } from 'preact-iso';
import ServicesDashboard from './Service/Dashboard';
import CreateForm from './Service/CreateForm';

function Services() {
  return (
    <Router>
      <Route path="/dashboard" component={ServicesDashboard} />
      <Route path="/create" component={CreateForm} />
      <Route path="/:id" component={() => <h2>TODO</h2>} />
    </Router>
  )
}


export default Services;