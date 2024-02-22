import { Amplify } from 'aws-amplify';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { AlertWrapper } from './components/alerts/AlertWrapper';
import Layout from './components/layouts/Layout';
import Background from './hooks/BackgroundHook';
import Login from './pages/auth/login';
import RequestResetPassword from './pages/auth/request-reset';
import ResetPassword from './pages/auth/reset';
import SignUp from './pages/auth/sign-up';
import CreateEditDeletePersona from './pages/persona/create-update-delete';
import Personas from './pages/personas';
import App from './pages/thread';
import Welcome from './pages/welcome';
import { AlertProvider } from './providers/AlertProvider';
import { AuthProvider } from './providers/AuthProvider';
import { BackgroundProvider } from './providers/BackgroundProvider';
import { Protected } from './providers/Protected';
import './styles/index.css';
import { AudioProvider } from './providers/AudioProvider';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID,
      loginWith: {
        email: true
      },
      userAttributes: {
        email: {
          required: true
        }
      },
      signUpVerificationMethod: 'code'
    }
  },
  API: {
    GraphQL: {
      endpoint: import.meta.env.VITE_API_URL,
      defaultAuthMode: 'userPool',
      region: 'us-east-2'
    }
  }
});

// Auth Routes
const AuthRoutes = [
  { path: 'sign-up', element: <SignUp /> },
  { path: 'login', element: <Login /> },
  { path: 'request-reset', element: <RequestResetPassword /> },
  { path: 'reset', element: <ResetPassword /> }
];

// Main App Routes
const AppRoutes = [
  { path: '/', element: <Welcome /> },
  { path: '/personas', element: <Personas /> },
  { path: '/personas/create', element: <CreateEditDeletePersona /> },
  { path: '/personas/update/:personaId', element: <CreateEditDeletePersona /> },
  { path: '/thread/:threadId', element: <App /> }
];

// Root Router Configuration
const routerConfig = [
  {
    element: <Layout />,
    children: [
      {
        element: (
          <Protected>
            <Outlet />
          </Protected>
        ),
        children: AppRoutes
      },
      {
        path: '/auth',
        children: AuthRoutes
      }
    ]
  }
];

const router = createBrowserRouter(routerConfig);

export default router;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BackgroundProvider>
      <Background />
      <AuthProvider>
        <AudioProvider>
          <AlertProvider>
            <AlertWrapper>
              <RouterProvider router={router} />
            </AlertWrapper>
          </AlertProvider>
        </AudioProvider>
      </AuthProvider>
    </BackgroundProvider>
  </React.StrictMode>
);
