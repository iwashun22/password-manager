import { useLocation } from 'preact-iso';
import { useRef, useState, useCallback, useEffect } from 'preact/hooks';
import { FormEvent } from 'preact/compat';
import BackButton from '@/components/BackButton';
import SearchBar from '@/components/SearchBar';
import ServiceCard from '@/components/ServiceCard';
import { refreshTrigger } from '@/utils/triggers';
import { setError } from '@/components/ErrorHandler';

import './Dashboard.scss';

const filterFn = (searchStr: string) => (sv: ServiceProp) =>
  sv.service_name.toLowerCase().startsWith(searchStr.toLowerCase());

function ServicesDashboard() {
  const location = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState('');
  const [serviceList, setServiceList] = useState<Array<ServiceProp>>([]);

  const navigateHome = useCallback(() => {
    location.route('/');
  }, []);

  const navigateToForm = useCallback(() => {
    location.route('/services/create');
  }, []);

  const updateList = useCallback(() => {
    (async () => {
      const data = await window.db.getAllServices() as ServiceProp[];

      if (data === null) {
        setServiceList([]);
        setError('Something went wrong');
        return;
      }

      setServiceList(data)
    })();
  }, []);

  const handleSearch = useCallback((e: FormEvent) => {
    e.preventDefault();

    setSearchValue(searchRef.current?.value || '');
  }, []);

  useEffect(() => {
    // TODO:
  }, [searchValue]);

  useEffect(() => {
    updateList();
  }, [refreshTrigger.value]);

  return (
    <>
      <BackButton onClick={navigateHome}/>
      <SearchBar
        searchRef={searchRef}
        onSearch={handleSearch}
        onAddNew={navigateToForm}
        placeholder='service name'
      />
      <div className="container">
        {
          serviceList.length === 0 ?
            <h2 className="bg-text">No accounts for any services.</h2>
          :
            serviceList.filter(filterFn(searchValue)).length === 0 ?
              <h2 className="bg-text">No services match the search query.</h2>
            :
            serviceList
              .filter(filterFn(searchValue))
              .map((sv, i) => (
                <div className="spacing">
                  <ServiceCard key={i} {...sv} />
                </div>
              ))
        }
      </div>
    </>
  )
}

export default ServicesDashboard;