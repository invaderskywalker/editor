// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { store } from './redux/store';
import {SocketProvider} from './hooks/SocketProvider';
import { UserProvider } from './hooks/UserProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
      <SocketProvider>
        <BrowserRouter>
          <UserProvider>
            <App />
          </UserProvider>
        </BrowserRouter>
      </SocketProvider>
    </Provider>
);