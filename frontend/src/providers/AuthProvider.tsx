import * as Auth from 'aws-amplify/auth';
import {
  AuthUser,
  ConfirmResetPasswordInput,
  ConfirmSignInInput,
  ConfirmSignUpInput,
  ResetPasswordInput,
  SignInInput,
  SignUpInput
} from 'aws-amplify/auth';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthState {
  loaded: boolean;
  user: AuthUser | undefined;
  userAttributes: Auth.FetchUserAttributesOutput | undefined;
  groups: string[];
  signUp(input: SignUpInput): Promise<Auth.SignUpOutput | undefined>;
  confirmSignUp(input: ConfirmSignUpInput): Promise<Auth.ConfirmSignUpOutput | undefined>;
  signIn(input: SignInInput): Promise<Auth.SignInOutput | undefined>;
  confirmSignIn(input: ConfirmSignInInput): Promise<Auth.ConfirmSignInOutput | undefined>;
  signOut(): Promise<void>;
  resetPassword(input: Auth.ResetPasswordInput): Promise<void>;
  confirmResetPassword(input: Auth.ConfirmResetPasswordInput): Promise<void>;
}

export const AuthContext = createContext<AuthState>({} as AuthState);

export const useAuth = () => useContext(AuthContext);

interface AuthProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProps) => {
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState<Auth.AuthUser | undefined>(undefined);
  const [groups, setGroups] = useState<string[]>([]);
  const [userAttributes, setUserAttributes] = useState<Auth.FetchUserAttributesOutput | undefined>(
    undefined
  );

  useEffect(() => {
    checkUser();
  }, []);

  async function signUp(input: SignUpInput) {
    const result = await Auth.signUp(input);
    await checkUser();
    return result;
  }

  async function confirmSignUp(input: ConfirmSignUpInput) {
    const result = await Auth.confirmSignUp(input);
    await checkUser();
    return result;
  }

  async function confirmSignIn(input: ConfirmSignInInput) {
    const result = await Auth.confirmSignIn(input);
    await checkUser();
    return result;
  }

  async function signIn(input: SignInInput) {
    const result = await Auth.signIn(input);
    await checkUser();
    return result;
  }

  async function signOut() {
    await Auth.signOut();
    clearUser();
  }

  async function checkUser() {
    try {
      const user = await Auth.getCurrentUser();
      if (user) {
        const userAttributes = await Auth.fetchUserAttributes();
        const groups =
          ((await Auth.fetchAuthSession()).tokens?.accessToken.payload[
            'cognito:groups'
          ] as string[]) ?? [];
        setUser(user);
        setUserAttributes(userAttributes);
        setGroups(groups);
      } else {
        clearUser();
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoaded(true);
    }
  }

  async function clearUser() {
    setUser(undefined);
    setUserAttributes(undefined);
  }

  async function resetPassword(input: ResetPasswordInput) {
    await Auth.resetPassword(input);
  }

  async function confirmResetPassword(input: ConfirmResetPasswordInput) {
    await Auth.confirmResetPassword(input);
  }

  return (
    <AuthContext.Provider
      value={{
        loaded,
        user,
        userAttributes,
        groups,
        signUp,
        confirmSignUp,
        signIn,
        confirmSignIn,
        signOut,
        resetPassword,
        confirmResetPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
