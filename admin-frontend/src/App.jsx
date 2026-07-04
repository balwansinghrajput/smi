import { Provider } from 'react-redux';
import store from './app/store';
import AppRoutes from './routes/AppRoutes';
import GlobalLoader from './components/GlobalLoader';

function App() {
  return (
    <Provider store={store}>
      <GlobalLoader />
      <AppRoutes />
    </Provider>
  );
}

export default App;
