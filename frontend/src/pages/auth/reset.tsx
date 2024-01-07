import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useBackground } from '../../providers/BackgroundProvider';
import { useAuth } from '../../providers/AuthProvider';

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

  const resetPassword = async (event: any) => {
    event.preventDefault();

    try {
      await auth.confirmResetPassword(resetInput);
      navigate(`/auth/login`);
    } catch (err: any) {
      setError(err.message);
      console.error(JSON.stringify(err));
    }
  };

  return (
    <>
      <div className="w-full mt-4 mb-8">
        <h1 className="text-2xl font-extrabold w-full">Reset Password 🔐</h1>
        <p className="text-gray-500">You got a code. Enter it (and your new password).</p>
      </div>
      <form className="w-full flex flex-col">
        {[
          { field: 'Confirmation Code', key: 'confirmationCode' },
          { field: 'New Password', key: 'newPassword' }
        ].map((field, index) => (
          <input
            key={index}
            className="w-full shadow-md rounded-xl p-2 my-2"
            type={index === 0 ? 'text' : 'password'}
            placeholder={field.field}
            onChange={(e) => setResetInput({ ...resetInput, [field.key]: e.target.value })}
          />
        ))}
        <button className="btn" onClick={resetPassword}>
          Login
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
