import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import reportWebVitals from './reportWebVitals';
import './index.css';

import 'primeicons/primeicons.css';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/bootstrap4-light-blue/theme.css';
import 'primereact/resources/themes/lara-light-blue/theme.css';

import { ScrollToTop } from 'global/scrollToTop';

import store from './store';

import App from './App';

import StateProvider from 'components/contexts/StateProvider/StateProvider';

import './';
import './i18n';
import { Online, Offline, Detector } from 'react-detect-offline';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ScrollToTop>
          <StateProvider>
            <App />
          </StateProvider>
        </ScrollToTop>
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          closeOnClick={true}
          pauseOnHover={true}
          draggable={true}
          progress={undefined}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);

reportWebVitals();
