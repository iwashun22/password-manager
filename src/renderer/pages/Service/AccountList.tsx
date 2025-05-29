import { useRoute, useLocation } from 'preact-iso';
import { useCallback, useEffect, useState } from 'preact/hooks';
import BackButton from '@/components/BackButton';
import { setError } from '@/components/ErrorHandler';
import ServiceAccountCard from '@/components/ServiceAccountCard';

const DASHBOARD_URL = '/services/dashboard';

function AccountList() {
  const route = useRoute();
  const location = useLocation();
  const [accounts, setAccounts] = useState<Array<ServiceAccountProp>>([]);

  const id = Number(route.params['id']);

  useEffect(() => {
    (async () => {
      const services = await window.db.getAllServices();

      if (services === null) {
        location.route(DASHBOARD_URL);
        return;
      }

      if (services.filter(s => s.id === id).length !== 1) {
        location.route(DASHBOARD_URL);
        return;
      }

      const accounts = await window.db.getServiceAccountsById(id);

      if (accounts === null || accounts.length === 0) {
        setError('Something went wrong');
        location.route(DASHBOARD_URL);
        return;
      }
      setAccounts(accounts);
      console.log(accounts);
    })();
  }, []);

  const navigateToDashboard = useCallback(() => {
    location.route(DASHBOARD_URL);
  }, []);

  return (
    <>
      <BackButton onClick={navigateToDashboard}/>
      {
        accounts.map(acc => (
          <ServiceAccountCard {...acc}/>
        ))
      }
    </>
  )
}

export default AccountList;