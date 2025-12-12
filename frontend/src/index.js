import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'antd/dist/reset.css';

import { store } from './redux/store';
import { Provider } from 'react-redux';

import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext'; 
import { CheckoutProvider } from './Context/CheckoutContext';
import { ConfigProvider } from 'antd';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ConfigProvider compat>
      <Provider store={store}>
        <BrowserRouter>
          <AuthProvider>
            <CheckoutProvider>
              <App />
            </CheckoutProvider>
          </AuthProvider>
        </BrowserRouter>
      </Provider>
    </ConfigProvider>
  </React.StrictMode>
);

reportWebVitals();
