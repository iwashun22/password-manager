import BackButton from '@/components/BackButton';
import { useCallback, useEffect, useState, useRef } from 'preact/hooks';
import { useLocation, useRoute } from 'preact-iso';
import { setError } from '../../components/ErrorHandler';
import FormContainer, { ButtonContainer} from '@/components/FormInput';
import FormInputText from '@/components/FormInput/Text';
import FormInputSelect from '@/components/FormInput/CustomSelect';
import FormBackButton from '@/components/FormInput/BackButton';
import FormInputSubmit from '@/components/FormInput/Submit';


function EditAccountForm() {
  const location = useLocation();
  const route = useRoute();

  const accountId = Number(route.params['id']);

  const [serviceId, setServiceId] = useState(-1);
  const [serviceName, setServiceName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [subaddress, setSubaddress] = useState('');
  const [password, setPassword] = useState('');

  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const account = await window.db.getServiceAccountsById(accountId, 'account');

      if (account === null) {
        setError('Account not found');
        location.route('/services/dashboard');
        return;
      }

      const { email_id, service_id, subaddress, encrypted_password } = account[0];

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
          setEmail(emailAccount.email);
        }
      }

    })();
  }, [accountId]);

  const navgiateBack = useCallback(() => {
    const path = `/services/${serviceId}`;
    location.route(path);
  }, [serviceId]);

  return (
    <>
      <BackButton onClick={navgiateBack}/>
      <FormContainer onSubmit={() => {}}>
        <FormInputText
          placeholder='username'
          inputRef={usernameRef}
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