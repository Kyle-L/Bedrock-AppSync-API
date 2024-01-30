import { motion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';

export default function AuthLayout() {
  const location = useLocation();

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

      {/* Navbar */}
      <Navbar />

      {/* Footer */}
      <Footer />
    </div>
  );
}
