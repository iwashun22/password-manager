import { useRoute, useLocation } from 'preact-iso';
import { useCallback, useEffect, useState } from 'preact/hooks';
import BackButton from '@/components/BackButton';
import { setError } from '@/components/ErrorHandler';
import ServiceAccountCard from '@/components/ServiceAccountCard';
import { UserPlus, Settings } from 'lucide-preact';
import { refreshTrigger } from '@/utils/triggers';
import { modifyAccountSignal } from '@/utils/triggers';
import { choseServiceId, AccountForm } from './CreateForm';
import { signal } from '@preact/signals';

import './AccountList.scss';

const DASHBOARD_URL = '/services/dashboard';

const openFormSignal = signal(false);

function AccountList() {
  const route = useRoute();
  const location = useLocation();
  const [accounts, setAccounts] = useState<Array<ServiceAccountProp>>([]);
  const [serviceName, setServiceName] = useState('');
  const [description, setDescription] = useState('');

  const id = Number(route.params['id']);

  const updateList = useCallback(() => {
    (async () => {
      const services = await window.db.getAllServices() as Array<ServiceProp>;

      if (services === null) {
        location.route(DASHBOARD_URL);
        return;
      }

      const service = services.filter(s => s.id === id);
      if (service.length === 0) {
        location.route(DASHBOARD_URL);
        return;
      }
      setServiceName(service[0].service_name);
      setDescription(service[0].description_text);

      const accounts = await window.db.getServiceAccountsById(id, 'service');

      if (accounts === null || accounts.length === 0) {
        setError('Something went wrong');
        location.route(DASHBOARD_URL);
        return;
      }
      setAccounts(accounts);
    })();
  }, [id]);

  useEffect(() => {
    updateList();

    return () => {
      setAccounts([]);
      setServiceName('');
      setDescription('');
    }
  }, [refreshTrigger.value]);

  const navigateToDashboard = useCallback(() => {
    location.route(DASHBOARD_URL);
  }, []);

  const openForm = useCallback(() => {
    choseServiceId.value = id;
    openFormSignal.value = true;
  }, [id]);
  
  const closeForm = useCallback(() => {
    choseServiceId.value = -1;
    openFormSignal.value = false;
  }, []);

  const navigateBackAfterSubmit = useCallback(() => {
    closeForm();
    const path = `/services/${id}`;
    location.route(path);
  }, [id]);

  const navigateToServiceInfo = useCallback(() => {
    const path = `/services/edit/service/${id}`;
    location.route(path);
  }, [id]);

  if (modifyAccountSignal.value !== -1) {
    const path = `/services/edit/account/${modifyAccountSignal.value}`;
    location.route(path);
  }

  if (openFormSignal.value) return (
    <AccountForm
      backButtonOnClick={closeForm}
      formBackButtonOnClick={closeForm}
      afterSubmit={navigateBackAfterSubmit}
    />
  )

  return (
    <>
      <BackButton onClick={navigateToDashboard}/>
      <header className="header">
        <h1 className="title">
          Accounts for <i className="highlight">{serviceName}</i>
        </h1>
        {
          description &&
          <p className="description">{ description }</p>
        }
        <div className="edit-btn-container">
          <button className="btn" onClick={openForm}>
            <UserPlus className="icon" />
          </button>
          <button className="btn" onClick={navigateToServiceInfo}>
            <Settings className="icon" />
          </button>
        </div>
      </header>
      <main className="main-container">
        {
          accounts.map((acc, i) => (
            <div className="spacer" key={i}>
              <ServiceAccountCard {...acc}/>
            </div>
          ))
        }
      </main>
    </>
  )
}

export default AccountList;