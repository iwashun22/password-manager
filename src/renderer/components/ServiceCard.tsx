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
    const MIME_TYPE = 'image/png';
    if (favicon_png !== null) {
      const blob = new Blob([favicon_png], { type: MIME_TYPE });
      url = URL.createObjectURL(blob);

      setImageUrl(url);
    }
    else {
      (async () => {
        const retryResponse = await window.user.retryFetchFavicon(id, domain_name);

        if (retryResponse === null) return;

        const blob = new Blob([retryResponse], { type: MIME_TYPE });
        url = URL.createObjectURL(blob);
        setImageUrl(url);
      })();
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
            !imageUrl ?
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