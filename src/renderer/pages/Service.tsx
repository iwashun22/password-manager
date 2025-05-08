import { useLocation } from 'preact-iso';
import { FormEvent } from 'preact/compat';
import { useRef, useCallback, useState, useEffect } from 'preact/hooks';
import BackButton from '@/components/BackButton';
import SearchBar from '@/components/SearchBar';
import FormContainer from '@/components/FormInput';
import FormInputSelect from '@/components/FormInput/CustomSelect';
import FormInputSubmit from '@/components/FormInput/Submit';
import { signal } from '@preact/signals';

const formOpenSignal = signal(false);

function Service() {
  const location = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState('');
  const [servicesData, setServicesData] = useState<Array<ServiceAccountProp>>([]);

  const navigateHome = useCallback(() => {
    location.route('/');
  }, []);

  const openForm = useCallback(() => {
    formOpenSignal.value = true;
  }, []);

  const updateList = useCallback(() => {
  
  }, []);

  const handleSearch = useCallback((e: FormEvent) => {
    e.preventDefault();

    setSearchValue(searchRef.current?.value || '');
  }, []);

  useEffect(() => {

  }, [searchValue]);

  if (formOpenSignal.value) return (
    <ServiceForm />
  )

  return (
    <>
      <BackButton onClick={navigateHome}/>
      <SearchBar
        searchRef={searchRef}
        onSearch={handleSearch}
        onAddNew={openForm}
        placeholder='service name'
      />
    </>
  )
}

function ServiceForm() {
  const [services, setServices] = useState([]);
  const serviceName = useRef(null);

  useEffect(() => {
    (async () => {
      
    })();
  }, []);

  const closeForm = useCallback(() => {
    formOpenSignal.value = false;
  }, []);

  return (
    <>
      <BackButton onClick={closeForm}/>
      <FormContainer onSubmit={closeForm}>
        <FormInputSelect
          selectItems={services}
          inputRef={serviceName}
          onInput={() => {}}
        />
        <FormInputSubmit text='next'/>
      </FormContainer>
    </>
  )
}

export default Service;