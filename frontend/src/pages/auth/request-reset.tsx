import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBackground } from '../../providers/BackgroundProvider';
import { useAuth } from '../../providers/AuthProvider';
import Container from '../../components/layouts/Container';

export default function RequestResetPassword() {
  const background = useBackground();
  background.setBackground('purple');

  const [requestInput, setRequestInput] = useState({ username: '' });
  const [error, setError] = useState<string | undefined>();

  const auth = useAuth();
  const navigate = useNavigate();

  const requestReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await auth.resetPassword(requestInput);
      navigate(`/auth/reset?username=${requestInput.username}`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message ?? 'Something went wrong!');
      }
    }
  };

  return (
    <Container>
      <div className="w-full max-w-md mx-auto mt-8 mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Forgot Password</h1>
        <p className="text-slate-500 text-center mb-6">
          Enter your email to receive a password reset code
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={requestReset}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Your email"
              value={requestInput.username}
              onChange={(e) => setRequestInput({ ...requestInput, username: e.target.value })}
              required
            />
          </div>
          <div className="flex items-center justify-center">
            <button
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full"
              type="submit"
            >
              Send Reset Code
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
          <p className="text-slate-600 mt-2">
            New user?{' '}
            <Link className="text-purple-600 hover:text-purple-800 font-medium" to="/auth/sign-up">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </Container>
  );
}
