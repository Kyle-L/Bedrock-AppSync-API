import { useContext } from 'react';
import { AlertContext } from '../providers/AlertProvider';

export default function useAlert() {
  const alerts = useContext(AlertContext);
  return alerts;
}

export function useAddAlert() {
  const { addAlert } = useContext(AlertContext);
  if (!addAlert) return null;
  return addAlert;
}

export function useRemoveAlert() {
  const { removeAlert } = useContext(AlertContext);
  if (!removeAlert) return null;
  return removeAlert;
}
