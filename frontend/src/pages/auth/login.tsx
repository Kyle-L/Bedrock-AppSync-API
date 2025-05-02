import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBackground } from '../../providers/BackgroundProvider';
import { useAuth } from '../../providers/AuthProvider';
import Container from '../../components/layouts/Container';

export default function Login() {
  const background = useBackground();
  background.setBackground('blue');

  const [input, setInput] = useState({ username: '', password: '' });
  const [error, setError] = useState<string | undefined>();

  const auth = useAuth();
  const navigate = useNavigate();

  const signIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await auth.signIn(input);
      navigate('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message ?? 'Something went wrong!');
      }
    }
  };

  return (
    <Container>
      <div className="w-full mt-4 mb-8">
        <h1 className="text-2xl font-extrabold w-full">Login 🔐</h1>
        <p className="text-slate-500">Please enter your email and password</p>
      </div>
      <form className="w-full flex flex-col" onSubmit={signIn}>
        {['Email', 'Password'].map((field, index) => (
          <input
            key={index}
            className="w-full shadow-md rounded-xl p-2 my-2"
            type={index === 0 ? 'text' : 'password'}
            placeholder={field}
            onChange={(e) =>
              setInput({ ...input, [index === 0 ? 'username' : 'password']: e.target.value })
            }
          />
        ))}
        <button className="btn" type="submit">
          Login
        </button>
      </form>
      {error && (
        <div className="bg-red-200 w-full rounded-xl p-2 my-2">
          <p className="text-slate-500">{error}</p>
        </div>
      )}
      <div className="flex flex-row justify-center mt-10">
        <span className="text-slate-500 mr-1">New user?</span>
        <Link className="text-red-500" to="/auth/sign-up">
          Sign Up
        </Link>
      </div>
      <div className="flex flex-row justify-center mt-2">
        <span className="text-slate-500 mr-1">Forgot your password?</span>
        <Link className="text-red-500" to="/auth/request-reset">
          Reset Password
        </Link>
      </div>
    </Container>
  );
}
