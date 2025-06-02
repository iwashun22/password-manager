import { signal } from '@preact/signals';
import Toast from './Toast';

const messageSignal = signal('');
export const setMessage = (message: string) => {
  messageSignal.value = message;
}

function SuccessLogHandler() {
  if (messageSignal.value) return (
    <Toast
      message={messageSignal.value}
      variant='success'
      onClose={() => {
        setMessage('');
      }}
    />
  )
}

export default SuccessLogHandler;