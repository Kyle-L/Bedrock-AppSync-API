import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './pages/App';
import './styles/index.css';
import Container from './components/Container';
import Background from './components/Background';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Background />
    <Container>
      <App />
    </Container>
  </React.StrictMode>
);
