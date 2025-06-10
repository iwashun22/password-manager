import BackButton from '@/components/BackButton';
import { useCallback, useEffect, useState, useRef } from 'preact/hooks';
import { FormEvent } from 'preact/compat';
import { useLocation, useRoute } from 'preact-iso';
import { setError } from '../../components/ErrorHandler';
import FormContainer, { ButtonContainer} from '@/components/FormInput';
import FormInputText from '@/components/FormInput/Text';
import FormInputSelect from '@/components/FormInput/CustomSelect';
import FormBackButton from '@/components/FormInput/BackButton';
import FormInputSubmit from '@/components/FormInput/Submit';
import { triggerUpdate, editAccountId } from '@/utils/triggers';
import { matchEmailPattern } from '@/utils/helper';

const DASHBOARD_URL = '/services/dashboard';

function isTypeofAccount(object: object): object is ServiceAccountProp {
  return 'id' in object && 'username' in object && 'email_id' in object;
}

function EditAccountForm() {
  const location = useLocation();
  const route = useRoute();

  const accountId = Number(route.params['id']);

  const [serviceId, setServiceId] = useState(-1);
  const [emails, setEmails] = useState<string[]>([]);
  const [serviceName, setServiceName] = useState('');

  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const emailAccounts = await window.db.getAllEmailAccounts();
      setEmails(emailAccounts.map(acc => acc.email));
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const account = await window.db.getServiceAccountsById(accountId, 'account');

      if (account === null) {
        setError('Account not found');
        location.route(DASHBOARD_URL);
        return;
      }

      const { username, email_id, service_id, subaddress, encrypted_password, oauth_provider } = account[0];

      if (oauth_provider) {
        location.route(DASHBOARD_URL);
        return;
      }

      const decrypted = await window.user.requestDecryptedPassword(encrypted_password, 'get');
      passwordRef.current!.value = decrypted;

      const service = await window.db.getAllServices(service_id);
      if (service === null) {
        setError('Service not found');
        location.route('/services/dashboard');
        return;
      }
      else {
        setServiceName(service.service_name);
        setServiceId(service_id);
      }

      if (email_id) {
        const emailAccount = await window.db.getEmailAccount(email_id);
        if (emailAccount) {
          const [emailName, domain] = emailAccount.email.split('@');
          emailRef.current!.value = subaddress ?
            `${emailName}+${subaddress}@${domain}` : emailAccount.email;
        }
      }

      if (username) {
        usernameRef.current!.value = username;
      }

    })();
  }, [accountId]);

  const navgiateBack = useCallback(() => {
    editAccountId(-1);
    const path = `/services/${serviceId}`;
    location.route(path);
  }, [serviceId]);

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();

    // let info: Info | undefined | null;
    (async () => {
      const [val_email, val_username, val_password] = ([emailRef, usernameRef, passwordRef]).map(ref => ref.current?.value || '');

      if (!val_username && !val_email) {
        setError('You must provide a username or an email');
        return;
      }
      if (!val_password) {
        setError('No password was provided');
        return;
      }

      const validEmail = matchEmailPattern(val_email);

      if (val_email && !validEmail) {
        setError('Invalid email format');
        return;
      }

      let emailId: number | null = null;
      let subaddress: string | null = null;

      if (validEmail) {
        subaddress = validEmail.subaddress;
        const emailExist = await window.db.getEmailAccount(validEmail.email);

        if (!emailExist) {
          setError('This email does not exist');
          return;
        }
        emailId = emailExist.id;
      }

      const info = await window.db.editServiceAccount(accountId, serviceId, val_username, emailId, subaddress, val_password);

      if (info === null) {
        setError('Something went wrong');
        return;
      }

      if (isTypeofAccount(info)) {
        if ((info.username === val_username) && (info.username !== '')) {
          setError('This username is already in use');
        }
        else {
          setError('This email is already in use');
        }
        return;
      }

      triggerUpdate();
      editAccountId(-1);
      const path = `/services/${serviceId}`;
      location.route(path);
    })();
  }, [accountId, serviceId]);

  return (
    <>
      <BackButton onClick={navgiateBack}/>
      <FormContainer
        onSubmit={handleSubmit}
        headerText={`edit ${serviceName} account`}
      >
        <FormInputText
          placeholder='username'
          inputRef={usernameRef}
        />
        <FormInputSelect
          placeholder='email'
          selectItems={emails}
          inputRef={emailRef}
        />
        <FormInputText
          placeholder='password'
          type='password'
          inputRef={passwordRef}
        />
        <ButtonContainer>
          <FormBackButton text='cancel' onClick={navgiateBack} />
          <FormInputSubmit text='save' />
        </ButtonContainer>
      </FormContainer>
    </>
  )
}

export default EditAccountForm;