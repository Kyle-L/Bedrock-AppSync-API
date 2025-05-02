import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useBackground } from '../../providers/BackgroundProvider';
import { useAuth } from '../../providers/AuthProvider';
import Container from '../../components/layouts/Container';

export default function ResetPassword() {
  const background = useBackground();
  background.setBackground('purple');

  const [resetInput, setResetInput] = useState({
    username: '',
    newPassword: '',
    confirmationCode: ''
  });
  const [error, setError] = useState<string | undefined>();
  const [searchParams] = useSearchParams();

  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.has('username')) {
      setResetInput({ ...resetInput, username: searchParams.get('username') ?? '' });
    }
  }, []);

  const resetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await auth.confirmResetPassword(resetInput);
      navigate(`/auth/login`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message ?? 'Something went wrong!');
      }
    }
  };

  return (
    <Container>
      <div className="w-full max-w-md mx-auto mt-8 mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Reset Password</h1>
        <p className="text-slate-500 text-center mb-6">
          Enter the code from your email and create a new password
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={resetPassword}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="confirmationCode"
            >
              Confirmation Code
            </label>
            <input
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="confirmationCode"
              type="text"
              placeholder="Enter code"
              value={resetInput.confirmationCode}
              onChange={(e) => setResetInput({ ...resetInput, confirmationCode: e.target.value })}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
              New Password
            </label>
            <input
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="newPassword"
              type="password"
              placeholder="Create a new password"
              value={resetInput.newPassword}
              onChange={(e) => setResetInput({ ...resetInput, newPassword: e.target.value })}
              required
            />
          </div>
          <div className="flex items-center justify-center">
            <button
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full"
              type="submit"
            >
              Reset Password
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-slate-600">
            Remember your password?{' '}
            <Link className="text-purple-600 hover:text-purple-800 font-medium" to="/auth/login">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </Container>
  );
}
