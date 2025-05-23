import { useState, useEffect } from 'preact/hooks';
import { Globe } from 'lucide-preact';

import './ServiceCard.scss';

function ServiceCard({
  id, service_name, description_text, domain_name, favicon_png, count
}: ServiceProp) {
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    let url: string;
    if (favicon_png !== null) {
      const blob = new Blob([favicon_png], { type: 'image/png' });
      url = URL.createObjectURL(blob);
      console.log(favicon_png.length);

      setImageUrl(url);
    }

    return () => {
      URL.revokeObjectURL(url);
    }
  }, [favicon_png]);

  return (
    <div className="service-card-container">
      <div className="icon-container">
        {
          favicon_png === null ?
          <Globe className="favicon"/>
          :
          <img src={imageUrl} alt="service-favicon" className="favicon"/>
        }
      </div>
    </div>
  )
}

export default ServiceCard;