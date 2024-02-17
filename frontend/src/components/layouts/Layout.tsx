import { Outlet } from 'react-router-dom';
import { Footer } from '../Footer';
import { Navbar } from '../Navbar';

export default function Layout() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

      <div className="flex flex-col items-center min-h-screen justify-center pt-20 lg:pb-20">
        <Outlet />
      </div>

      {/* Footer */}
      <Footer />

      {/* Navbar */}
      <Navbar />

    </div>
  );
}
