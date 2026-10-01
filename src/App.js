import React from 'react';
import { BankProvider, useBank } from './contexts/BankContext';
import LoginScreen from './pages/auth/Login';
import DashboardScreen from './pages/user/Dashboard';
import TransfersScreen from './pages/user/Transfers';
import LoansScreen from './pages/user/Loans';

function MainAppContent() {
  const { currentScreen, isAuthenticated } = useBank();

  if (!isAuthenticated || currentScreen === 'login') {
    return <LoginScreen />;
  }

  switch (currentScreen) {
    case 'transferencias':
      return <TransfersScreen />;
    case 'emprestimos':
      return <LoansScreen />;
    case 'dashboard':
    default:
      return <DashboardScreen />;
  }
}

function App() {
  return (
    <BankProvider>
      <MainAppContent />
    </BankProvider>
  );
}

export default App;
