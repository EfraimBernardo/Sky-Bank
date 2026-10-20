import React from 'react';
import { BankProvider, useBank } from './contexts/BankContext';
import LoginScreen from './pages/auth/Login';
import DashboardScreen from './pages/user/Dashboard';
import WalletScreen from './pages/user/Wallet';
import TransfersScreen from './pages/user/Transfers';
import PaymentsScreen from './pages/user/Payments';
import LoansScreen from './pages/user/Loans';
import ProfileScreen from './pages/user/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';

function MainAppContent() {
  const { currentScreen, isAuthenticated } = useBank();

  if (!isAuthenticated || currentScreen === 'login') {
    return <LoginScreen />;
  }

  switch (currentScreen) {
    case 'carteira':
      return <WalletScreen />;
    case 'transferencias':
      return <TransfersScreen />;
    case 'pagamentos':
      return <PaymentsScreen />;
    case 'emprestimos':
      return <LoansScreen />;
    case 'perfil':
      return <ProfileScreen />;
    case 'admin':
      return <AdminDashboard />;
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
