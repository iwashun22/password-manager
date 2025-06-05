import { useLocation } from 'preact-iso';
import { FormEvent } from 'preact/compat';
import { useState, useRef, useCallback, useEffect } from 'preact/hooks';
import { signal, useSignalEffect } from '@preact/signals';
import { setError } from '@/components/ErrorHandler';
import BackButton from '@/components/BackButton';
import SearchBar from '@/components/SearchBar';
import FormContainer from '@/components/FormInput';
import FormInputText from '@/components/FormInput/Text';
import FormInputSubmit from '@/components/FormInput/Submit';
import EmailCard from '@/components/EmailCard';
import { matchEmailPattern } from '@/utils/helper.ts';
import { refreshTrigger, triggerUpdate } from '@/utils/triggers';

import './Email.scss';

const formOpenSignal = signal(false);
const emailSearchSignal = signal('');
const lastViewedServiceId = signal(-1);

export const setSignalSearchValue = (email: string) => {
  emailSearchSignal.value = email;
}

export const setLastViewedServiceId = (id: number) => {
  lastViewedServiceId.value = id;
}

const filterSearchValue = (searchString: string) => (data: EmailProp) => {
  const email = data['email'];
  return email.toLowerCase().startsWith(searchString.toLowerCase());
}

function Email() {
  const location = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState('');
  const [navigatedFromService, setNavigatedFromService] = useState(false);
  const [emailData, setEmailData] = useState<Array<EmailProp>>([]);

  const updateList = useCallback(() => {
    (async () => {
      const data = await window.db.getAllEmailAccounts();
      setEmailData(data);
    })();
  }, []);

  const navigateHome = useCallback(() => {
    const path = (navigatedFromService && (lastViewedServiceId.value !== -1)) ?
    `/services/${lastViewedServiceId.value}` : '/';

    setNavigatedFromService(false);
    setLastViewedServiceId(-1);
    setSignalSearchValue('');

    location.route(path);
  }, [navigatedFromService]);

  const handleSearch = useCallback((e: FormEvent) => {
    e.preventDefault();

    setSearchValue(searchRef.current?.value || '');
  }, []);

  const openForm = useCallback((e: unknown) => {
    formOpenSignal.value = true;
  }, []);

  useEffect(() => {
    updateList();
  }, [refreshTrigger.value]);

  // Trigger when navigated from Service page
  useSignalEffect(() => {
    if (searchRef.current === null) return;

    if (lastViewedServiceId.value !== -1) {
      setNavigatedFromService(true);
    }

    if (emailSearchSignal.value) {
      setSearchValue(emailSearchSignal.value);
      searchRef.current.value = emailSearchSignal.value;
    }
  });

  if (formOpenSignal.value) return (
    <EmailForm/>
  )

  return (
    <>
      <BackButton onClick={navigateHome}/>
      <SearchBar
        placeholder='Find email'
        onSearch={handleSearch}
        onAddNew={openForm}
        searchRef={searchRef}
      />
      <div className="container">
      {
        emailData.length  === 0 ?
         <h2 className="bg-text">No email data to display</h2>
        :
          emailData.filter(filterSearchValue(searchValue)).length === 0 ?
            <h2 className="bg-text">No emails match the search query.</h2>
          :
            emailData.filter(filterSearchValue(searchValue)).map((v, i) => (
              <EmailCard {...v} key={i} />
            ))
      }
      </div>
    </>
  )
}

function EmailForm() {
  const emailAccountRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const closeForm = useCallback(() => {
    formOpenSignal.value = false;
  }, []);

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    const [email, passwd] = [emailAccountRef.current, passwordRef.current];
    if (email && passwd) {
      let emailAddress: ReturnType<typeof matchEmailPattern>;
      if (!email.value) {
        setError('Email is missing');
        return;
      }
      else {
        emailAddress = matchEmailPattern(email.value);

        if (emailAddress === undefined) {
          setError('Invalid email format');
          return;
        }
        else if (emailAddress.subaddress !== null) {
          setError('Subaddressing is disabled for adding an email')
          return;
        }
      }

      if (!passwd.value) {
        setError('Password is missing');
        return;
      }

      (async () => {
        try {
          const info = await window.db.createEmailAccount(emailAddress.email, passwd.value);
          console.log(info);
          formOpenSignal.value = false;
          triggerUpdate();
        }
        catch (err) {
          console.warn(err);
        }
      })();
    }
  }, []);

  return (
    <>
      <BackButton onClick={closeForm}/>
      <FormContainer onSubmit={handleSubmit} headerText='new email account'>
        <FormInputText
          inputRef={emailAccountRef}
          placeholder='email'
        />
        <FormInputText
          type='password'
          inputRef={passwordRef}
          placeholder='password'
        />
        <FormInputSubmit text='add'/>
      </FormContainer>
    </>
  )
}

export default Email;