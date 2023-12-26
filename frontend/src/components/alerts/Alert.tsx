import { Alert } from '../../providers/AlertProvider';

interface AlertProps {
  alert: Alert;
  unmountSelf: () => void;
}

export function AlertComponent({ alert, unmountSelf }: AlertProps) {
  let color = 'bg-green-50 text-green-700';
  let icon = 'fas fa-check-circle';
  switch (alert.type) {
    case 'success':
      color = 'bg-green-50 text-green-700';
      icon = 'fas fa-check-circle';
      break;
    case 'error':
      color = 'bg-red-50 text-red-700';
      icon = 'fas fa-exclamation-circle';
      break;
    case 'warning':
      color = 'bg-yellow-50 text-yellow-700';
      icon = 'fas fa-exclamation-triangle';
      break;
    case 'info':
      color = 'bg-blue-50 text-blue-700';
      icon = 'fas fa-info-circle';
      break;
    default:
      break;
  }

  return (
    <div className={`${color} shadow-md rounded-lg p-4`}>
      <div className="flex items-center">
        <i className={icon}></i>
        <div className="ml-3">
          <p className="text-sm leading-5 font-medium">{alert.message}</p>
        </div>
        <button onClick={unmountSelf} className="mx-2 focus:outline-none">
          <i className="fas fa-close"></i>
        </button>
      </div>
    </div>
  );
}
