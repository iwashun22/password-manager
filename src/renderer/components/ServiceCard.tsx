import { useState, useEffect } from 'preact/hooks';
import { useCallback } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import { Globe } from 'lucide-preact';

import './ServiceCard.scss';

function ServiceCard({
  id, service_name, description_text, domain_name, favicon_png, count
}: ServiceProp) {
  const location = useLocation();
  const [imageUrl, setImageUrl] = useState('');

  const navigateServiceAccounts = useCallback(() => {
    const path = `/services/${id}`;
    location.route(path);
  }, [id]);

  useEffect(() => {
    let url: string;
    if (favicon_png !== null) {
      const blob = new Blob([favicon_png], { type: 'image/png' });
      url = URL.createObjectURL(blob);

      setImageUrl(url);
    }
    else {
      // TODO: Retry getting the favicon image from domain_name
    }

    return () => {
      URL.revokeObjectURL(url);
    }
  }, [favicon_png]);

  return (
    <div className="service-card-container" onClick={navigateServiceAccounts}>
      <div className="favicon-container">
        <span>
          {
            favicon_png === null ?
            <Globe className="favicon"/>
            :
            <img src={imageUrl} alt="service-favicon" className="favicon"/>
          }
        </span>
      </div>
      <div className="context-container">
        <h2 className="name">{ service_name }</h2>
        {
          description_text &&
          <p className="description">{ description_text }</p>
        }
        <div className="accounts-number">
          <i>Accounts </i>
          <span className="number">{ count }</span>
        </div>
      </div>
    </div>
  )
}

export default ServiceCard;