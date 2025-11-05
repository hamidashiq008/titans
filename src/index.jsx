// third party
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from './contexts/ConfigContext';

// project imports
import App from './App';
import reportWebVitals from './reportWebVitals';
import { store, persistor } from './redux/store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

// style + assets
import './index.scss';

// -----------------------|| REACT DOM RENDER  ||-----------------------//

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <ConfigProvider>
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
    <App />
    </PersistGate>
  </Provider>
  </ConfigProvider>
);

reportWebVitals();
