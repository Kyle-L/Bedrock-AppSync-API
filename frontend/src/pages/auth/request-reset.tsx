import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBackground } from '../../providers/BackgroundProvider';
import { useAuth } from '../../providers/AuthProvider';

export default function RequestResetPassword() {
  const background = useBackground();
  background.setBackground('purple');

  const [requestInput, setRequestInput] = useState({ username: '' });
  const [error, setError] = useState<string | undefined>();

  const auth = useAuth();
  const navigate = useNavigate();

  const requestReset = async (event: any) => {
    event.preventDefault();

    try {
      await auth.resetPassword(requestInput);
      navigate(`/auth/reset?username=${requestInput.username}`);
    } catch (err: any) {
      setError(err.message);
      console.error(JSON.stringify(err));
    }
  };

  return (
    <>
      <div className="w-full mt-4 mb-8">
        <h1 className="text-2xl font-extrabold w-full">Request Password Reset 🔐</h1>
        <p className="text-gray-500">Please enter your email</p>
      </div>
      <form className="w-full flex flex-col">
        <input
          className="w-full shadow-md rounded-xl p-2 my-2"
          type={'text'}
          placeholder={'Email'}
          onChange={(e) => setRequestInput({ ...requestInput, username: e.target.value })}
        />
        <button
          className="bg-red-500 text-white font-bold rounded-xl p-2 my-2 ml-auto hover:bg-red-800 transition-colors duration-300"
          onClick={requestReset}
        >
          Request Reset
        </button>
      </form>
      {error && (
        <div className="bg-red-200 w-full rounded-xl p-2 my-2">
          <p className="text-gray-500">{error}</p>
        </div>
      )}
      <div className="flex flex-row justify-center mt-10">
        <span className="text-gray-500 mr-1">New user?</span>
        <Link className="text-red-500" to="/auth/sign-up">
          Sign Up
        </Link>
      </div>
    </>
  );
}
