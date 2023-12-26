import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { useBackground } from '../../providers/BackgroundProvider';

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

  const signIn = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    try {
      await auth.signUp(signUpInput);
      setConfirmSignUp(true);
      setConfirmSignUpInput({ ...confirmSignUpInput, username: signUpInput.username });
    } catch (err: any) {
      setError(err.message);
      console.error('err: ', err);
    }
  };

  const confirm = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    try {
      await auth.confirmSignUp(confirmSignUpInput);
      await auth.signIn({
        username: confirmSignUpInput.username,
        password: signUpInput.password
      });
      navigate('/');
    } catch (err: any) {
      setError(err.message);
      console.error('err: ', err);
    }
  };

  return (
    <>
      <div className="w-full mt-4 mb-8">
        <h1 className="text-2xl font-extrabold w-full">
          {confirmSignUp ? 'Confirm 🔐' : 'Sign Up 🔐'}
        </h1>
        <p className="text-gray-500">
          {confirmSignUp ? 'You got a code. Enter it.' : 'Please enter your email and password'}
        </p>
      </div>
      <form className="w-full flex flex-col items-center justify-center">
        {confirmSignUp ? (
          <input
            className="w-full shadow-md rounded-xl p-2 my-2"
            type="text"
            placeholder="Confirmation Code"
            value={confirmSignUpInput.confirmationCode}
            onChange={(e) =>
              setConfirmSignUpInput({ ...confirmSignUpInput, confirmationCode: e.target.value })
            }
          />
        ) : (
          <>
            <input
              className="w-full shadow-md rounded-xl p-2 my-2"
              type="text"
              placeholder="Name"
              value={signUpInput.options?.userAttributes.name}
              onChange={(e) =>
                setSignUpInput({
                  ...signUpInput,
                  options: { userAttributes: { name: e.target.value } }
                })
              }
            />
            <input
              className="w-full shadow-md rounded-xl p-2 my-2"
              type="text"
              placeholder="Email"
              value={signUpInput.username}
              onChange={(e) => setSignUpInput({ ...signUpInput, username: e.target.value })}
            />
            <input
              className="w-full shadow-md rounded-xl p-2 my-2"
              type="password"
              placeholder="Password"
              value={signUpInput.password}
              onChange={(e) => setSignUpInput({ ...signUpInput, password: e.target.value })}
            />
          </>
        )}
        <button
          className="bg-red-500 text-white font-bold rounded-xl p-2 my-2 ml-auto hover:bg-red-800 transition-colors duration-300"
          onClick={confirmSignUp ? confirm : signIn}
        >
          {confirmSignUp ? 'Confirm' : 'Sign Up'}
        </button>
      </form>
      <div className="flex flex-row justify-center mt-10">
        <span className="text-gray-500 mr-1">Already have an account?</span>
        <Link className="text-red-500" to="/auth/login">
          Sign In
        </Link>
      </div>
      {error && (
        <div className="bg-red-200 w-full rounded-xl p-2 my-2">
          <p className="text-gray-500">{error}</p>
        </div>
      )}
    </>
  );
}
