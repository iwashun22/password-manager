import { useState, useRef, useCallback, useEffect } from 'preact/compat';
import { FormEvent } from 'preact/compat';
import FormContainer, { LabelText, ButtonContainer } from '@/components/FormInput';
import FormInputSelect from '@/components/FormInput/CustomSelect';
import FormInputText, { FormTextArea } from '@/components/FormInput/Text';
import FormInputSubmit from '@/components/FormInput/Submit';
import FormBackButton from '@/components/FormInput/BackButton';
import Switch from '@/components/Switch';
import BackButton from '@/components/BackButton';
import { useLocation } from 'preact-iso';
import { signal } from '@preact/signals';
import { checkValidDomain, matchEmailPattern } from '@/utils/helper';
import { setError } from '@/components/ErrorHandler';
import { triggerUpdate } from '@/utils/triggers';

import './CreateForm.scss';

const savedServiceName = signal('');
const savedServiceDomainName = signal('');
const savedServiceDescription = signal('');
const describeService = signal(false);
const readyToAddAccount = signal(false);
export const choseServiceId = signal(-1);

export function clearAll() {
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
    if (!name) return setError('No service name was provided');

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
    const longText = description.current.value;
    const trimmed = longText.trim().replace('\n', ' ').replace(/\s+/g, ' ');
    savedServiceDescription.value = trimmed;

    readyToAddAccount.value = true;
  }, []);

  const navigateBack = useCallback(() => {
    clearAll();
    location.route('/services/dashboard');
  }, []);

  if (describeService.value && !readyToAddAccount.value) return (
    <>
    <BackButton onClick={navigateBack}/>
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

const DEFAULT_OAUTH_PROVIDERS = ['APPLE', 'GITHUB', 'GOOGLE'];
export function AccountForm({ backButtonOnClick }: {
  backButtonOnClick: () => void
}) {
  const location = useLocation();
  const [emailAccounts, setEmailAccounts] = useState<Array<EmailProp>>([]);
  const [providers, setProviders] = useState(DEFAULT_OAUTH_PROVIDERS);
  const [checkOAuth, setCheckOAuth] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const oAuthRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const emailData = await window.db.getAllEmailAccounts();
      setEmailAccounts(emailData);

      const providerData = await window.db.getOAuthProviders();
      const removeNull = providerData.filter(p => p.length);
      if (removeNull.length > 0) {
        setProviders(removeNull);
      }
    })();
  }, []);

  const formBack = useCallback(() => {
    readyToAddAccount.value = false;
  }, []);

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();

    (async () => {

    if (!usernameRef.current || !emailRef.current || !passwordRef.current || !oAuthRef.current)
      return;

    const [val_user, val_email, val_password, val_oauth] = [usernameRef, emailRef, passwordRef, oAuthRef].map(ref => ref.current!.value);

    if ((!val_user && !val_email) || (!val_email && checkOAuth)) {
      setError('No account was provided');
      return;
    }
    else if (!val_password && !checkOAuth) {
      setError('No password was provided');
      return;
    }

    const emailAcc = matchEmailPattern(val_email);
    if (emailAcc === undefined && val_email.length > 0) {
      setError('Invalid email format');
      return;
    }

    // New service
    if (choseServiceId.value === -1) {
      const info = await window.db.createService(
        savedServiceName.value,
        savedServiceDomainName.value,
        savedServiceDescription.value
      );

      if (!info) {
        setError('Something went wrong');
        return;
      }

      choseServiceId.value = info.lastInsertRowid;
    }

    let info: Info | null;
    if (checkOAuth) {
      // Handle OAuth
      if (!val_oauth) {
        setError('No OAuth provider was specified');
        return;
      }

      const emailExist = await window.db.getEmailAccount(emailAcc!.email);
      if (emailExist === undefined) {
        setError('This email does not exist');
        return;
      }
      else if (emailAcc!.subaddress) {
        setError('Subaddressing is not allowed');
        return;
      }

      const oauthProvider = providers.filter(
        p => p.toLowerCase() === val_oauth.toLowerCase()
      )[0] || val_oauth;

      const serviceAccountExist = await window.db.getServiceAccount(choseServiceId.value, '', emailExist.id, '', oauthProvider);

      if (serviceAccountExist === null) {
        setError('Something went wrong');
        return;
      }
      if (serviceAccountExist !== undefined) {
        setError('This account is already registered');
        return;
      }

      info = await window.db.createServiceAccount(choseServiceId.value, emailExist.id, null, '', '', oauthProvider);
    }
    else {
      // Handle Account with Password

      if (emailAcc !== undefined) {
        const emailExist = await window.db.getEmailAccount(emailAcc.email);
        if (emailExist === undefined) {
          setError("This email does not exist");
          return;
        }

        const serviceAccountAlreadyCreated = await window.db.getServiceAccount(choseServiceId.value, '', emailExist.id, emailAcc.subaddress, '');

        if (serviceAccountAlreadyCreated === null) {
          setError('Something went wrong');
          return;
        }
        if (serviceAccountAlreadyCreated !== undefined) {
          setError('This email is already registered');
          return;
        }

        info = await window.db.createServiceAccount(
          choseServiceId.value,
          emailExist.id,
          emailAcc.subaddress,
          val_user,
          val_password,
          null
        );
      }
      else {
        const serviceAccountAlreadyCreated = await window.db.getServiceAccount(choseServiceId.value, val_user, null, null, '');

        if (serviceAccountAlreadyCreated === null) {
          setError('Something went wrong');
          return;
        }

        if (serviceAccountAlreadyCreated !== undefined) {
          setError('This username is already registered');
          return;
        }

        info = await window.db.createServiceAccount(choseServiceId.value, null, null, val_user, val_password, null);
      }
    }

    if (info === null) {
      setError('Failed to add the account');
    }
    else {
      triggerUpdate();
      clearAll();
      location.route('/services/dashboard');
    }

    })();
  }, [checkOAuth]);

  useEffect(() => {
    if (checkOAuth) {
      passwordRef.current!.value = '';
    } else {
      oAuthRef.current!.value = '';
    }
  }, [checkOAuth]);

  return (
    <>
      <BackButton onClick={backButtonOnClick}/>
      <FormContainer onSubmit={handleSubmit} headerText='account'>
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
          disabled={checkOAuth}
        />
        <div className="checkbox-wrapper">
          <div>
            <Switch
              state={checkOAuth}
              setState={setCheckOAuth}
              >
              <i style={{ textTransform: 'capitalize' }}>
                OAuth
              </i>
            </Switch>
          </div>
          <FormInputSelect
            selectItems={providers}
            inputRef={oAuthRef}
            placeholder='provider'
            disabled={!checkOAuth}
          />
        </div>
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