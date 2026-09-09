import React from 'react';
import { AppProvider } from './context/AppContext';
import { AppContainer } from './components/Layout/AppContainer';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContainer />
    </AppProvider>
  );
};

export default App;
