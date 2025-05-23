import { useLocation } from 'preact-iso';
import { FormEvent } from 'preact/compat';
import { useState, useRef, useCallback, useEffect } from 'preact/hooks';
import { signal } from '@preact/signals';
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

const filterSearchValue = (searchString: string) => (data: EmailProp) => {
  const email = data['email'];
  const regex = new RegExp(searchString, "i");

  const match = email.match(regex);
  return match !== null;
}

function Email() {
  const location = useLocation();
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchValue, setSearchValue] = useState('');
  const [emailData, setEmailData] = useState<Array<EmailProp>>([]);

  const updateList = useCallback(() => {
    (async () => {
      const data = await window.db.getAllEmailAccounts();
      setEmailData(data);
    })();
  }, []);

  const navigateHome = useCallback(() => {
    location.route('/');
  }, []);

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