import { signal } from '@preact/signals';

export const refreshTrigger = signal(0);
export const triggerUpdate = () => {
  refreshTrigger.value += 1;
  window.user.saveDatabase();
}