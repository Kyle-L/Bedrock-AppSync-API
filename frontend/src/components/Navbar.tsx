import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

export function Navbar() {
  const { user, userAttributes, loaded, signOut } = useAuth();
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
            Behavior <span className="text-sm">by Kyle</span>
          </Link>
          <div className="flex items-center gap-4">
            <div
              className="w-10 h-10 rounded-full bg-slate-300 overflow-hidden cursor-pointer flex items-center justify-center hover:ring-2 hover:ring-slate-400 transition-all"
              onClick={() => navigate('/auth/settings')}
            >
              {userAttributes?.picture ? (
                <img
                  src={userAttributes.picture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={`https://avatar.iran.liara.run/username?username=${userAttributes?.name || userAttributes?.email || 'user'}`}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <button
              className="btn"
              onClick={() => {
                signOut();
                navigate('/auth/login');
              }}
            >
              Logout
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
