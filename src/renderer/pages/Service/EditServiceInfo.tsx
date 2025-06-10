import { useCallback, useRef, useEffect } from 'preact/hooks';
import { useRoute, useLocation } from 'preact-iso';
import { FormEvent } from 'preact/compat';
import BackButton from '@/components/BackButton';
import FormContainer, { ButtonContainer, LabelText } from '@/components/FormInput';
import FormInputText, { FormTextArea } from '@/components/FormInput/Text';
import FormBackButton from '@/components/FormInput/BackButton';
import FormInputSubmit from '@/components/FormInput/Submit';
import { setError } from '@/components/ErrorHandler';
import { checkValidDomain } from '@/utils/helper';
import { triggerUpdate } from '@/utils/triggers';


function EditServiceInfo() {
  const route = useRoute();
  const location = useLocation();

  const id = Number(route.params['id']);
  
  const serviceNameRef = useRef<HTMLInputElement>(null);
  const domainRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const navigateBackToList = useCallback(() => {
    const path = `/services/${id}`;
    location.route(path);
  }, [id]);

  useEffect(() => {
    (async () => {
      const service = await window.db.getAllServices(id);

      if (service === null) {
        setError('Something went wrong');
        navigateBackToList();
        return;
      }

      serviceNameRef.current!.value = service.service_name;
      domainRef.current!.value = service.domain_name;
      descriptionRef.current!.value = service.description_text;
    })();
  }, [id]);

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    (async () => {
      const [val_service, val_domain, longText] = ([serviceNameRef, domainRef, descriptionRef]).map(ref => ref.current?.value || '');

      if (!val_service) {
        setError('No service name was provided');
        return;
      }

      const allServices = await window.db.getAllServices() as ServiceProp[];
      for (const { id: serviceId, service_name } of allServices) {
        if (
          (service_name.toLowerCase() === val_service.toLowerCase()) &&
          (serviceId !== id)
        ) {
          setError('This service name already exists');
          return;
        }
      }

      if (!val_domain) {
        setError('Domain name is missing');
        return;
      }
      if (!checkValidDomain(val_domain)) {
        setError('Invalid domain name format');
        return;
      }

      const trimmed = longText.trim().replace('\n', ' ').replace(/\s+/g, ' ');

      const info = await window.db.editService(id, val_service, val_domain, trimmed);

      if (info === null) {
        setError('Something went wrong');
        return;
      }

      triggerUpdate();
      const path = `/services/${id}`;
      location.route(path);
    })();
  }, [id]);
  
  return (
    <>
      <BackButton onClick={navigateBackToList}/>
      <FormContainer onSubmit={handleSubmit}>
        <LabelText
          text='service'
          labelFor={serviceNameRef}
        />
        <FormInputText
          inputRef={serviceNameRef}
          placeholder='service name'
        />
        <LabelText
          text='domain name'
          labelFor={domainRef}
        />
        <FormInputText
          inputRef={domainRef}
          placeholder='www.example.com'
          type='url'
        />
        <LabelText
          text='description'
          labelFor={descriptionRef}
        />
        <FormTextArea
          inputRef={descriptionRef}
          placeholder='Describe the service (optional).'
        />
        <ButtonContainer>
          <FormBackButton text='cancel' onClick={navigateBackToList} />
          <FormInputSubmit text='save' />
        </ButtonContainer>
      </FormContainer>
    </>
  )
}

export default EditServiceInfo;