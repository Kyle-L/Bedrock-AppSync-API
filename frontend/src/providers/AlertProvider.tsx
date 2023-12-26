import React, { useState } from 'react';

export type Alert = {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
};

interface AlertContextProps {
  alerts: Alert[];
  addAlert: (message: string, type: Alert['type']) => void;
  removeAlert: (id: string) => void;
}

export const AlertContext = React.createContext<AlertContextProps>({
  alerts: [],

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  addAlert: (message: string, type: Alert['type']) => {},

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  removeAlert: (id: string) => {}
});

export const useAlertContext = () => React.useContext(AlertContext);

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const addAlert = (message: string, type: Alert['type'], timeout = 5000) => {
    const alertId = Math.random().toString(36).substring(2, 9);
    setAlerts((alerts) => [...alerts, { id: alertId, message, type }]);

    // Remove the alert after x ms.
    setTimeout(() => {
      removeAlert(alertId);
    }, timeout);
  };

  const removeAlert = (id: string) => {
    setAlerts((alerts) => alerts.filter((alert) => alert.id !== id));
  };

  return { alerts, addAlert, removeAlert };
}

interface AlertProps {
  children: React.ReactNode;
}

export const AlertProvider = ({ children }: AlertProps) => {
  const alert = Alerts();

  return <AlertContext.Provider value={alert}>{children}</AlertContext.Provider>;
};
