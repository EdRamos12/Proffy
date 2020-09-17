import React from 'react';
import './assets/styles/global.css'
import Routes from './routes';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { AuthProvider } from './contexts/AuthContext';

const history = createBrowserHistory();

function App() {
  return (
    <Router history={history}>
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </Router>
  );
}

export default App;
