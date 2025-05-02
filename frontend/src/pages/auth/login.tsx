import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBackground } from '../../providers/BackgroundProvider';
import { useAuth } from '../../providers/AuthProvider';
import Container from '../../components/layouts/Container';

export default function Login() {
  const background = useBackground();
  background.setBackground('blue');

  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [challengeSignIn, setChallengeSignIn] = useState(false);
  const [challenge, setChallenge] = useState('');
  const [error, setError] = useState<string | undefined>();

  const auth = useAuth();
  const navigate = useNavigate();

  const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(undefined);

    try {
      if (challengeSignIn) {
        // Handle challenge response (like new password required)
        await auth.confirmSignIn({ challengeResponse: challenge });
        navigate('/');
      } else {
        const result = await auth.signIn(input);

        // Check if the next step is confirmation (user hasn't confirmed their account)
        if (result?.nextStep?.signInStep === 'CONFIRM_SIGN_UP') {
          navigate('/auth/confirm', {
            state: {
              username: input.username,
              password: input.password
            }
          });
        } else if (result?.nextStep?.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
          setChallengeSignIn(true);
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message ?? 'Something went wrong!');
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <Container>
      <div className="w-full max-w-md mx-auto mt-8 mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Sign In</h1>
        <p className="text-slate-500 text-center mb-6">Welcome back! Please sign in to continue.</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={signIn}>
          {challengeSignIn ? (
            <div className="mb-6">
              <p className="mb-4 text-gray-700">
                Before you can sign in, you need to set a new password.
              </p>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="newPassword">
                New Password
              </label>
              <input
                className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="newPassword"
                type="password"
                placeholder="New password"
                value={challenge}
                onChange={(e) => setChallenge(e.target.value)}
                required
              />
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="email"
                  type="email"
                  placeholder="Your email"
                  value={input.username}
                  onChange={(e) => setInput({ ...input, username: e.target.value })}
                  required
                />
              </div>
              <div className="mb-6 relative">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-10"
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Your password"
                    value={input.password}
                    onChange={(e) => setInput({ ...input, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <span className="text-gray-700">Hide</span>
                    ) : (
                      <span className="text-gray-700">Show</span>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
          <div className="flex items-center justify-center">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full flex justify-center items-center"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
              ) : null}
              {challengeSignIn ? 'Set New Password' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-slate-600 mb-2">
            <Link
              className="text-blue-600 hover:text-blue-800 font-medium"
              to="/auth/request-reset"
            >
              Forgot your password?
            </Link>
          </p>
          <p className="text-slate-600">
            Don't have an account?{' '}
            <Link className="text-blue-600 hover:text-blue-800 font-medium" to="/auth/sign-up">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </Container>
  );
}
