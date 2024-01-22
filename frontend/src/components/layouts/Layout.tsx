import { AnimatePresence, motion } from 'framer-motion';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';

export default function AuthLayout() {
  const { user, loaded, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const authenticated = user && loaded;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center min-h-screen justify-center pt-20 pb-20">
        <div className="bg-slate-100 max-w-3xl w-full rounded-lg p-4 lg:p-12">
          <motion.div
            className="flex flex-col items-center justify-center"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.25 }}
            key={location.key}
          >
            <Outlet />
          </motion.div>
        </div>
      </div>
      <AnimatePresence mode="wait">
        {authenticated && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.25 }}
            className="fixed top-0 left-0 w-full h-16 bg-slate-100 flex items-center justify-between px-4 sm:px-6 lg:px-8 drop-shadow-lg"
          >
            <button
              className="btn"
              onClick={() => {
                signOut();
                navigate('/auth/login');
              }}
            >
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
