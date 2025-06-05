import BackButton from '@/components/BackButton';
import { useCallback, useEffect, useState, useRef } from 'preact/hooks';
import { useLocation, useRoute } from 'preact-iso';
import { setError } from '../../components/ErrorHandler';
import FormContainer, { ButtonContainer} from '@/components/FormInput';
import FormInputText from '@/components/FormInput/Text';
import FormInputSelect from '@/components/FormInput/CustomSelect';
import FormBackButton from '@/components/FormInput/BackButton';
import FormInputSubmit from '@/components/FormInput/Submit';
import { editAccountId } from '@/utils/triggers';

const DASHBOARD_URL = '/services/dashboard';

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

  return (
    <>
      <BackButton onClick={navgiateBack}/>
      <FormContainer
        onSubmit={() => {}}
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