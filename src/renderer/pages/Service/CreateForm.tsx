import { useState, useRef, useCallback, useEffect } from 'preact/compat';
import { FormEvent } from 'preact/compat';
import FormContainer, { LabelText, ButtonContainer } from '@/components/FormInput';
import FormInputSelect from '@/components/FormInput/CustomSelect';
import FormInputText, { FormTextArea } from '@/components/FormInput/Text';
import FormInputSubmit from '@/components/FormInput/Submit';
import FormBackButton from '@/components/FormInput/BackButton';
import BackButton from '@/components/BackButton';
import Toast from '@/components/Toast';
import { useLocation } from 'preact-iso';
import { signal } from '@preact/signals';
import { checkValidDomain } from '@/utils/helper';


const savedServiceName = signal('');
const savedServiceDomainName = signal('');
const savedServiceDescription = signal('');
const choseServiceId = signal(-1);
const describeService = signal(false);
const readyToAddAccount = signal(false);

function clearAll() {
  savedServiceName.value = '';
  savedServiceDomainName.value = '';
  savedServiceDescription.value = '';
  choseServiceId.value = -1;
  readyToAddAccount.value = false;
  describeService.value = false;
}

function backToFirstForm() {
  savedServiceDomainName.value = '';
  savedServiceDescription.value = '';
  readyToAddAccount.value = false;
  describeService.value = false;
}

function CreateForm() {
  const location = useLocation();
  const [services, setServices] = useState<Array<ServiceProp>>([]);
  const [error, setError] = useState('');
  const serviceName = useRef<HTMLInputElement>(null);
  const domainName = useRef<HTMLInputElement>(null);
  const description = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    (async () => {
      const servicesData = await window.db.getAllServices();
      if (servicesData === null) {
        setError('something went wrong');
      }
      else {
        setServices(servicesData);
      }
    })();
  }, []);

  const chooseService = useCallback((e: FormEvent) => {
    e.preventDefault();
    const name = serviceName.current?.value || '';
    if (!name) return;

    let included = false;
    services.forEach(s => {
      // the service name matches
      if (s.service_name.toLowerCase() === name.toLowerCase()) {
        included = true;
        choseServiceId.value = s.id;
      }
    });

    // True if the service exists (created previously).
    readyToAddAccount.value = included;
    // True if the service doesn't exist.
    describeService.value = !included;

    savedServiceName.value = name;
  }, [services]);

  const handleServiceInfo = useCallback((e: FormEvent) => {
    e.preventDefault();
    if (!domainName.current || !description.current) return;
    if (!domainName.current.value) {
      setError('Domain name is missing');
      return;
    }

    const validDomain = checkValidDomain(domainName.current.value);

    if (!validDomain) {
      setError('Invalid domain name format');
      return;
    }

    savedServiceDomainName.value = domainName.current.value;
    savedServiceDescription.value = description.current.value;

    readyToAddAccount.value = true;
  }, []);

  const navigateBack = useCallback(() => {
    clearAll();
    location.route('/services/dashboard');
  }, []);

  if (describeService.value && !readyToAddAccount.value) return (
    <>
    <BackButton onClick={navigateBack}/>
    {
      !!error &&
      <Toast
        message={error}
        variant='error'
        onClose={() => setError('')}
      />
    }
    <FormContainer onSubmit={handleServiceInfo} headerText='info'>
      <LabelText
        text='domain name'
        labelFor={domainName}
      />
      <FormInputText
        inputRef={domainName}
        placeholder='www.example.com'
        type='url'
        value={savedServiceDomainName.value}
      />
      <LabelText
        text='description'
        labelFor={description as any}
      />
      <FormTextArea
        inputRef={description}
        placeholder='Describe the service (optional).'
        value={savedServiceDescription.value}
      />
      <ButtonContainer>
        <FormBackButton text='back' onClick={backToFirstForm}/>
        <FormInputSubmit text='next'/>
      </ButtonContainer>
    </FormContainer>
    </>
  )

  if (readyToAddAccount.value) return (
    <AccountForm backButtonOnClick={navigateBack}/>
  )

  return (
    <>
      {
        !!error &&
        <Toast
          variant='error'
          message={error}
          onClose={() => setError('')}
        />
      }
      <BackButton onClick={navigateBack}/>
      <FormContainer onSubmit={chooseService} headerText='service name'>
        <FormInputSelect
          selectItems={services.map(v => v.service_name)}
          inputRef={serviceName}
          placeholder='Service'
          value={savedServiceName.value}
        />
        <FormInputSubmit text='next'/>
      </FormContainer>
    </>
  )
}

function AccountForm({ backButtonOnClick }: {
  backButtonOnClick: () => void
}) {
  const [emailAccounts, setEmailAccounts] = useState<Array<EmailProp>>([]);
  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  useEffect(() => {
    (async () => {
      const data = await window.db.getAllEmailAccounts();
      setEmailAccounts(data);
    })();
  }, []);

  const formBack = useCallback(() => {
    readyToAddAccount.value = false;
  }, []);

  return (
    <>
      <BackButton onClick={backButtonOnClick}/>
      <FormContainer onSubmit={() => {}} headerText='account'>
        <FormInputText
          inputRef={usernameRef}
          placeholder='username'
        />
        <FormInputSelect
          inputRef={emailRef}
          selectItems={emailAccounts.map(e => e.email)}
          placeholder='email'
        />
        <FormInputText
          inputRef={passwordRef}
          placeholder='password'
          type='password'
        />
        <ButtonContainer>
          <FormBackButton
            text='back'
            onClick={formBack}
          />
          <FormInputSubmit text='add'/>
        </ButtonContainer>
      </FormContainer>
    </>
  )
}

export default CreateForm;