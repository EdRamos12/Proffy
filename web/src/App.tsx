import React from 'react';
import './assets/styles/global.css'
import Routes from './routes';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { AuthProvider } from './contexts/AuthContext';
import { PostStorageProvider } from './contexts/PostStorage';
import { NotificationProvider } from './contexts/NotificationContext';

const history = createBrowserHistory();

function App() {
  return (
    <Router history={history}>
      <AuthProvider>
        <PostStorageProvider>
          <NotificationProvider>
            <Routes />
          </NotificationProvider>
        </PostStorageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
