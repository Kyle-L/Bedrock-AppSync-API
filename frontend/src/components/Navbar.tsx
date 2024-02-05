import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

export function Navbar() {
  const { user, loaded, signOut } = useAuth();
  const navigate = useNavigate();

  const authenticated = user && loaded;

  return (
    <AnimatePresence mode="wait">
      {authenticated && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.25 }}
          className="fixed top-0 left-0 w-full h-16 bg-slate-100 flex items-center justify-between px-4 sm:px-6 lg:px-8 drop-shadow-lg"
        >
          <Link className="font-display text-2xl font-bold text-slate-700" to="/">
            Behaviour <span className="text-sm">by Kyle</span>
          </Link>
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
  );
}
