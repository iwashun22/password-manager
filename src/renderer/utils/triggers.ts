import { signal } from '@preact/signals';

export const refreshTrigger = signal(0);
export const triggerUpdate = () => {
  refreshTrigger.value += 1;
  window.user.saveDatabase();
}

export const modifyAccountSignal = signal(-1);
export const editAccountId = (id: number) => {
  modifyAccountSignal.value = id;
}