import * as Auth from 'aws-amplify/auth';
import {
  AuthUser,
  ConfirmResetPasswordInput,
  ConfirmSignInInput,
  ConfirmSignUpInput,
  ResetPasswordInput,
  ResendSignUpCodeInput,
  SignInInput,
  SignUpInput,
  UpdateUserAttributesOutput,
  UpdatePasswordInput
} from 'aws-amplify/auth';
import { createContext, useContext, useEffect, useState } from 'react';

/**
 * Interface defining the authentication state and methods available in the auth context
 * @interface AuthState
 */
interface AuthState {
  /** Indicates if the auth state has finished loading */
  loaded: boolean;

  /** The current authenticated user or undefined if not authenticated */
  user: AuthUser | undefined;

  /** Additional attributes of the authenticated user */
  userAttributes: Auth.FetchUserAttributesOutput | undefined;

  /** Groups the authenticated user belongs to */
  groups: string[];

  /**
   * Register a new user
   * @param input - Sign up input containing username, password and other attributes
   * @returns Promise resolving to sign up output or undefined
   */
  signUp(input: SignUpInput): Promise<Auth.SignUpOutput | undefined>;

  /**
   * Confirm a user's registration
   * @param input - Confirmation input containing username and confirmation code
   * @returns Promise resolving to confirmation output or undefined
   */
  confirmSignUp(input: ConfirmSignUpInput): Promise<Auth.ConfirmSignUpOutput | undefined>;

  /**
   * Sign in a user
   * @param input - Sign in input containing username and password
   * @returns Promise resolving to sign in output or undefined
   */
  signIn(input: SignInInput): Promise<Auth.SignInOutput | undefined>;

  /**
   * Confirm sign in for MFA or custom challenges
   * @param input - Confirmation input containing challenge response
   * @returns Promise resolving to confirmation output or undefined
   */
  confirmSignIn(input: ConfirmSignInInput): Promise<Auth.ConfirmSignInOutput | undefined>;

  /**
   * Sign out the current user
   * @returns Promise that resolves when sign out is complete
   */
  signOut(): Promise<void>;

  /**
   * Initiate password reset flow
   * @param input - Reset password input containing username
   * @returns Promise that resolves when reset is initiated
   */
  resetPassword(input: Auth.ResetPasswordInput): Promise<Auth.ResetPasswordOutput | undefined>;

  /**
   * Confirm password reset with verification code
   * @param input - Confirmation input containing username, code, and new password
   * @returns Promise that resolves when password is reset
   */
  confirmResetPassword(input: Auth.ConfirmResetPasswordInput): Promise<void>;

  /**
   * Update the current user's password
   * @param input - Update password input containing old and new passwords
   * @returns Promise that resolves when password is updated
   */
  updatePassword(input: UpdatePasswordInput): Promise<void>;

  /**
   * Get the current authentication token
   * @returns Promise resolving to the JWT or undefined if not authenticated
   */
  getToken(): Promise<Auth.JWT | undefined>;

  /**
   * Update user attributes
   * @param attributes - Record of attribute key-value pairs to update
   * @returns Promise resolving to update output or undefined
   */
  updateUserAttributes(
    attributes: Record<string, string>
  ): Promise<UpdateUserAttributesOutput | undefined>;

  /**
   * Resend sign up verification code to the user
   * @param input - Input containing username to resend code to
   * @returns Promise resolving to boolean indicating success
   */
  resendSignUpCode(input: ResendSignUpCodeInput): Promise<boolean>;
}

/**
 * Authentication context for providing auth state throughout the application
 */
export const AuthContext = createContext<AuthState>({} as AuthState);

/**
 * Custom hook to access the authentication context
 * @returns The authentication state and methods
 */
export const useAuth = () => useContext(AuthContext);

/**
 * Props for the AuthProvider component
 * @interface AuthProps
 */
interface AuthProps {
  /** Child components that will have access to the auth context */
  children: React.ReactNode;
}

/**
 * Provider component that wraps the application and provides authentication state
 * @param props - The component props
 * @returns AuthProvider component
 */
export const AuthProvider = ({ children }: AuthProps) => {
  const [loaded, setLoaded] = useState(false);
  const [authState, setAuthState] = useState<{
    user?: Auth.AuthUser;
    userAttributes?: Auth.FetchUserAttributesOutput;
    groups: string[];
  }>({ groups: [] });

  const { user, userAttributes, groups } = authState;

  useEffect(() => {
    checkUser();
  }, []);

  /**
   * Updates the authentication state with current user information
   */
  const updateAuthState = async () => {
    try {
      const currentUser = await Auth.getCurrentUser().catch(() => undefined);

      if (!currentUser) {
        setAuthState({ groups: [] });
        return;
      }

      const attributes = await Auth.fetchUserAttributes().catch(() => undefined);
      const session = await Auth.fetchAuthSession().catch(() => undefined);
      const userGroups = (session?.tokens?.accessToken.payload['cognito:groups'] as string[]) || [];

      setAuthState({
        user: currentUser,
        userAttributes: attributes,
        groups: userGroups
      });
    } catch (error) {
      console.error('Error updating auth state:', error);
      setAuthState({ groups: [] });
    }
  };

  /**
   * Check if a user is currently authenticated and update state accordingly
   */
  const checkUser = async () => {
    try {
      await updateAuthState();
    } finally {
      setLoaded(true);
    }
  };

  /**
   * Helper function to wrap authentication actions with common error handling and state updates
   * @param action - The authentication action to execute
   * @returns Promise resolving to the action result or undefined
   */
  const wrapAuthAction = async <T,>(action: () => Promise<T>): Promise<T | undefined> => {
    try {
      const result = await action();
      await updateAuthState();
      return result;
    } catch (error) {
      console.error('Auth action failed:', error);
      throw error;
    }
  };

  /**
   * Register a new user
   * @param input - Sign up input containing username, password and attributes
   * @returns Promise resolving to sign up output or undefined
   */
  const signUp = (input: SignUpInput) => wrapAuthAction(() => Auth.signUp(input));

  /**
   * Confirm a user's registration
   * @param input - Confirmation input containing username and confirmation code
   * @returns Promise resolving to confirmation output or undefined
   */
  const confirmSignUp = (input: ConfirmSignUpInput) =>
    wrapAuthAction(() => Auth.confirmSignUp(input));

  /**
   * Sign in a user
   * @param input - Sign in input containing username and password
   * @returns Promise resolving to sign in output or undefined
   */
  const signIn = (input: SignInInput) => wrapAuthAction(() => Auth.signIn(input));

  /**
   * Confirm sign in for MFA or custom challenges
   * @param input - Confirmation input containing challenge response
   * @returns Promise resolving to confirmation output or undefined
   */
  const confirmSignIn = (input: ConfirmSignInInput) =>
    wrapAuthAction(() => Auth.confirmSignIn(input));

  /**
   * Initiate password reset flow
   * @param input - Reset password input containing username
   * @returns Promise that resolves when reset is initiated
   */
  const resetPassword = (input: ResetPasswordInput) =>
    wrapAuthAction(() => Auth.resetPassword(input));

  /**
   * Confirm password reset with verification code
   * @param input - Confirmation input containing username, code, and new password
   * @returns Promise that resolves when password is reset
   */
  const confirmResetPassword = (input: ConfirmResetPasswordInput) =>
    wrapAuthAction(() => Auth.confirmResetPassword(input));

  /**
   * Update the current user's password
   * @param input - Update password input containing old and new passwords
   * @returns Promise that resolves when password is updated
   */
  const updatePassword = (input: UpdatePasswordInput) =>
    wrapAuthAction(() => Auth.updatePassword(input));

  /**
   * Sign out the current user
   * @returns Promise that resolves when sign out is complete
   */
  const signOut = async () => {
    try {
      await Auth.signOut();
      setAuthState({ groups: [] });
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  };

  /**
   * Get the current authentication token
   * @returns Promise resolving to the JWT or undefined if not authenticated
   */
  const getToken = async () => {
    try {
      const session = await Auth.fetchAuthSession();
      return session?.tokens?.idToken;
    } catch (error) {
      console.error('Failed to get token:', error);
      return undefined;
    }
  };

  /**
   * Update user attributes
   * @param attributes - Record of attribute key-value pairs to update
   * @returns Promise resolving to update output or undefined
   */
  const updateUserAttributes = (attributes: Record<string, string>) =>
    wrapAuthAction(async () => {
      const userAttributes: Record<string, string> = {};
      Object.entries(attributes).forEach(([userAttributeKey, value]) => {
        userAttributes[userAttributeKey] = value;
      });
      return await Auth.updateUserAttributes({ userAttributes });
    });

  /**
   * Resend sign up verification code to the user
   * @param input - Input containing username to resend code to
   * @returns Promise resolving to boolean indicating success
   */
  const resendSignUpCode = async (input: ResendSignUpCodeInput): Promise<boolean> => {
    try {
      await Auth.resendSignUpCode(input);
      return true;
    } catch (error) {
      console.error('Failed to resend sign up code:', error);
      throw error;
    }
  };

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
        updatePassword,
        confirmResetPassword,
        getToken,
        updateUserAttributes,
        resendSignUpCode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
