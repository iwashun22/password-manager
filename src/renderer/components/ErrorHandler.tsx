import { signal } from '@preact/signals';
import Toast from './Toast';

const errorSignal = signal('');

export const setError = (message: string) => {
  errorSignal.value = message;
}

function ErrorHandler() {
  if (errorSignal.value) return (
    <Toast
      message={errorSignal.value}
      variant='error'
      onClose={() => {
        setError('');
      }}
    />
  )

  return null;
}

export default ErrorHandler;