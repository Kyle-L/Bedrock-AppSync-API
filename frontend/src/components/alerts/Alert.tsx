import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert } from '../../providers/AlertProvider';
import {
  faTimes,
  faCheckCircle,
  faExclamation,
  faInfoCircle,
  faExclamationCircle,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

interface AlertProps {
  alert: Alert;
  unmountSelf: () => void;
}

export function AlertComponent({ alert, unmountSelf }: AlertProps) {
  let color = 'bg-green-50 text-green-700';
  let icon = faCheckCircle;
  switch (alert.type) {
    case 'success':
      color = 'bg-green-50 text-green-700';
      icon = faCheckCircle;
      break;
    case 'error':
      color = 'bg-red-50 text-red-700';
      icon = faExclamationCircle;
      break;
    case 'warning':
      color = 'bg-yellow-50 text-yellow-700';
      icon = faExclamationTriangle;
      break;
    case 'info':
      color = 'bg-blue-50 text-blue-700';
      icon = faInfoCircle;
      break;
    default:
      break;
  }

  return (
    <div className={`${color} shadow-xl rounded-lg p-4`}>
      <div className="flex items-center">
        <FontAwesomeIcon icon={icon} />
        <div className="ml-3">
          <p className="leading-5 font-medium">{alert.message}</p>
        </div>
        <button onClick={unmountSelf} className="mx-2 focus:outline-none">
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </div>
  );
}
