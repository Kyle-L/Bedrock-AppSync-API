import { useState } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { useBackground } from '../../providers/BackgroundProvider';
import Container from '../../components/layouts/Container';

export default function Settings() {
  const background = useBackground();
  background.setBackground('teal');

  const auth = useAuth();

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: ''
  });
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const changePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);
    setSuccess(undefined);

    try {
      await auth.updatePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      setSuccess('Password changed successfully!');
      setPasswordForm({
        oldPassword: '',
        newPassword: ''
      });
      setIsChangingPassword(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message ?? 'Something went wrong!');
      }
    }
  };

  return (
    <Container>
      <div className="w-full max-w-2xl mx-auto mt-8 mb-8">
        <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
            <p>{success}</p>
          </div>
        )}

        <div className="mb-6">
          <div className="py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold">Profile Information</h2>
          </div>
          <div className="py-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
              <p className="text-gray-800">{auth.userAttributes?.name || 'Not provided'}</p>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <p className="text-gray-800">{auth.userAttributes?.email || 'Not available'}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold">Security</h2>
          </div>
          <div className="py-4">
            {isChangingPassword ? (
              <form onSubmit={changePassword}>
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="oldPassword"
                  >
                    Current Password
                  </label>
                  <input
                    className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="oldPassword"
                    type="password"
                    placeholder="Enter current password"
                    value={passwordForm.oldPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="newPassword"
                  >
                    New Password
                  </label>
                  <input
                    className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    className="text-gray-600 hover:text-gray-800 mr-4"
                    onClick={() => setIsChangingPassword(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Password</h3>
                  <p className="text-gray-600">Change your account password</p>
                </div>
                <button
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
                  onClick={() => setIsChangingPassword(true)}
                >
                  Change Password
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
