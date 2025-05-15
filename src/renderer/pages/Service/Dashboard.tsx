import { useLocation } from 'preact-iso';
import { useRef, useState, useCallback, useEffect } from 'preact/hooks';
import { FormEvent } from 'preact/compat';
import BackButton from '@/components/BackButton';
import SearchBar from '@/components/SearchBar';

function ServicesDashboard() {
  const location = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState('');

  const navigateHome = useCallback(() => {
    location.route('/');
  }, []);

  const navigateToForm = useCallback(() => {
    location.route('/services/create');
  }, []);

  const handleSearch = useCallback((e: FormEvent) => {
    e.preventDefault();

    setSearchValue(searchRef.current?.value || '');
  }, []);

  useEffect(() => {
    // TODO:
  }, [searchValue]);

  return (
    <>
      <BackButton onClick={navigateHome}/>
      <SearchBar
        searchRef={searchRef}
        onSearch={handleSearch}
        onAddNew={navigateToForm}
        placeholder='service name'
      />
    </>
  )
}

export default ServicesDashboard;