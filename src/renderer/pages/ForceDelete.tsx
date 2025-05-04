import { useCallback } from 'preact/hooks';
import { useLocation } from 'preact-iso';

import './ForceDelete.scss';

function ForceDelete() {
  const location = useLocation();

  const deleteData = useCallback(() => {
    window.db.deleteAllData();
    location.route('/welcome');
  }, []);

  return (
    <div className="danger-container">
      <h1 className="header">Detected Security Issue</h1>
      <p className="text">
        The sensitive data was most likely modified by the user, not the application. Click the button below to delete all data and start fresh.
      </p>
      <br/>
      <button
        className="delete-btn fw-bold"
        onClick={deleteData}
      >
        delete all data
      </button>
    </div>
  )
}

export default ForceDelete;