import { useLocation } from 'preact-iso';
import { useRef, useState, useCallback, useEffect } from 'preact/hooks';
import { FormEvent } from 'preact/compat';
import BackButton from '@/components/BackButton';
import SearchBar from '@/components/SearchBar';
import ServiceCard from '@/components/ServiceCard';
import { refreshTrigger, triggerUpdate } from '@/utils/triggers';
import { setError } from '@/components/ErrorHandler';

import './Dashboard.scss';

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
      const data = await window.db.getAllServices();

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
          serviceList
            .filter(sv => sv.service_name.toLowerCase().startsWith(searchValue.toLowerCase()))
            .map((sv, i) => (
              <ServiceCard key={i} {...sv} />
            ))
        }
      </div>
      <button onClick={triggerUpdate}>reload</button>
    </>
  )
}

export default ServicesDashboard;