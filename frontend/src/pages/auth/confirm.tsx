import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { useBackground } from '../../providers/BackgroundProvider';
import Container from '../../components/layouts/Container';

type LocationState = {
  username: string;
  password: string;
};

export default function ConfirmAccount() {
  const background = useBackground();
  background.setBackground('blue');

  const [loading, setLoading] = useState(false);
  const [confirmInput, setConfirmInput] = useState({
    username: '',
    confirmationCode: ''
  });
  const [error, setError] = useState<string | undefined>();
  const [searchParams] = useSearchParams();

  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize username from either location state or search params
  useEffect(() => {
    const locationState = location.state as LocationState | null;

    if (locationState?.username) {
      setConfirmInput((prev) => ({ ...prev, username: locationState.username }));
    } else if (searchParams.has('username')) {
      setConfirmInput((prev) => ({ ...prev, username: searchParams.get('username') ?? '' }));
    }
  }, [location, searchParams]);

  const handleConfirm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(undefined);

    try {
      await auth.confirmSignUp(confirmInput);

      // If we have the password from the state, automatically sign in
      const locationState = location.state as LocationState | null;
      if (locationState?.password) {
        await auth.signIn({
          username: confirmInput.username,
          password: locationState.password
        });
        navigate('/');
      } else {
        // Otherwise redirect to login
        navigate('/auth/login', {
          state: { message: 'Account confirmed successfully. Please sign in.' }
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message ?? 'Something went wrong!');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!confirmInput.username) {
      setError('Please enter your email first');
      return;
    }

    try {
      await auth.resendSignUpCode({
        username: confirmInput.username
      });
      setError(undefined);
      // Show success message
      alert('Confirmation code resent. Please check your email.');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message ?? 'Failed to resend code');
      }
    }
  };

  return (
    <Container>
      <div className="w-full max-w-md mx-auto mt-8 mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Confirm Your Account</h1>
        <p className="text-slate-500 text-center mb-6">
          Enter the verification code sent to your email
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleConfirm}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Your email"
              value={confirmInput.username}
              onChange={(e) => setConfirmInput({ ...confirmInput, username: e.target.value })}
              required
            />
          </div>
          <div className="mb-6">
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
              placeholder="Enter verification code"
              value={confirmInput.confirmationCode}
              onChange={(e) =>
                setConfirmInput({ ...confirmInput, confirmationCode: e.target.value })
              }
              required
            />
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Didn't receive the code?{' '}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-800 font-medium"
              onClick={handleResend}
            >
              Resend Code
            </button>
          </p>
          <div className="flex items-center justify-center">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full flex justify-center items-center"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
              ) : null}
              Verify Account
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-slate-600">
            Already confirmed?{' '}
            <Link className="text-blue-600 hover:text-blue-800 font-medium" to="/auth/login">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </Container>
  );
}
