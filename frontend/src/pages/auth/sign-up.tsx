import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { useBackground } from '../../providers/BackgroundProvider';
import Container from '../../components/layouts/Container';

export default function SignUp() {
  const background = useBackground();
  background.setBackground('green');

  const [signUpInput, setSignUpInput] = useState({
    username: '',
    password: '',
    options: { userAttributes: { name: '' } }
  });
  const [confirmSignUpInput, setConfirmSignUpInput] = useState({
    username: '',
    confirmationCode: ''
  });
  const [confirmSignUp, setConfirmSignUp] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const auth = useAuth();
  const navigate = useNavigate();

  const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await auth.signUp(signUpInput);
      setConfirmSignUp(true);
      setConfirmSignUpInput({ ...confirmSignUpInput, username: signUpInput.username });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message ?? 'Something went wrong!');
      }
    }
  };

  const confirm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await auth.confirmSignUp(confirmSignUpInput);
      await auth.signIn({
        username: confirmSignUpInput.username,
        password: signUpInput.password
      });
      navigate('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message ?? 'Something went wrong!');
      }
    }
  };

  return (
    <Container>
      <div className="w-full max-w-md mx-auto mt-8 mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">
          {confirmSignUp ? 'Confirm Account' : 'Create Account'}
        </h1>
        <p className="text-slate-500 text-center mb-6">
          {confirmSignUp
            ? 'Enter the verification code sent to your email'
            : 'Join us by creating a new account'}
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={confirmSignUp ? confirm : signIn}>
          {confirmSignUp ? (
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
                value={confirmSignUpInput.confirmationCode}
                onChange={(e) =>
                  setConfirmSignUpInput({ ...confirmSignUpInput, confirmationCode: e.target.value })
                }
                required
              />
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Full Name
                </label>
                <input
                  className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={signUpInput.options?.userAttributes.name}
                  onChange={(e) =>
                    setSignUpInput({
                      ...signUpInput,
                      options: { userAttributes: { name: e.target.value } }
                    })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="email"
                  type="email"
                  placeholder="Your email"
                  value={signUpInput.username}
                  onChange={(e) => setSignUpInput({ ...signUpInput, username: e.target.value })}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={signUpInput.password}
                  onChange={(e) => setSignUpInput({ ...signUpInput, password: e.target.value })}
                  required
                />
              </div>
            </>
          )}
          <div className="flex items-center justify-center">
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full"
              type="submit"
            >
              {confirmSignUp ? 'Verify Account' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-slate-600">
            Already have an account?{' '}
            <Link className="text-green-600 hover:text-green-800 font-medium" to="/auth/login">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </Container>
  );
}
