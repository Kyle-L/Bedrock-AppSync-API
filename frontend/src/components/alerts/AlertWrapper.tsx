import { AnimatePresence, motion } from 'framer-motion';
import useAlert, { useRemoveAlert } from '../../hooks/AlertHook';
import { AlertComponent } from './Alert';

export function AlertWrapper({ children }: { children: React.ReactNode }) {
  const alerts = useAlert();
  const remove = useRemoveAlert();

  if (!alerts || !remove) return <>{children}</>;

  return (
    <>
      <div className="flex fixed bottom-0 left-0 z-50 p-4">
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {alerts.alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 100, rotate: 90 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={{ opacity: 0, height: 0 }}
              >
                <AlertComponent alert={alert} unmountSelf={() => remove(alert.id)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      {children}
    </>
  );
}
