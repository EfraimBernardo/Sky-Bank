import React, { createContext, useContext, useState, useEffect } from 'react';

const BankContext = createContext();

const INITIAL_USER = {
  name: 'Efraim João Manuel Bernardo',
  shortName: 'Efraim João',
  accountNumber: 'SB-00000001',
  iban: 'AO06.0000.0001.0000.1234.5',
  balance: 162450.75,
  tier: 'Basic',
  tierIcon: '👑',
  creditLimit: 250000,
  email: 'efraim@skybank.ao',
  phone: '+244 923 456 789',
  address: 'Benfica, Talatona, Luanda',
  documentType: 'Bilhete de Identidade',
  documentNumber: '00210034AB66',
};

const INITIAL_TRANSACTIONS = [
  {
    id: 'tx-1',
    ref: 'SKB-TX-2025-09142',
    type: 'transfer_out',
    title: 'Transferência enviada',
    sub: 'Para: Maria Silva',
    recipient: 'Maria Silva',
    account: 'SB-00000012',
    iban: 'AO06.0000.0012.0000.8492.1',
    amount: 5000,
    date: 'Hoje, 16:20',
    fullDate: '23/06/2025 16:20',
    isPositive: false,
    category: 'Transferência',
    status: 'Concluído',
    fee: 0,
  },
  {
    id: 'tx-2',
    ref: 'SKB-TX-2025-08971',
    type: 'deposit',
    title: 'Depósito recebido',
    sub: 'Salário',
    recipient: 'SkyBank Tech S.A.',
    account: 'SB-00009999',
    iban: 'AO06.0000.9999.0000.1111.0',
    amount: 50000,
    date: 'Hoje, 14:32',
    fullDate: '23/06/2025 14:32',
    isPositive: true,
    category: 'Salário',
    status: 'Concluído',
    fee: 0,
  },
  {
    id: 'tx-3',
    ref: 'SKB-TX-2025-08630',
    type: 'payment',
    title: 'Pagamento de serviço',
    sub: 'Internet (ANGONET)',
    recipient: 'ANGONET Telecom',
    account: 'Entidade: 00412',
    iban: 'AO06.0040.0000.0412.9901.8',
    amount: 3500,
    date: 'Ontem, 11:45',
    fullDate: '22/06/2025 11:45',
    isPositive: false,
    category: 'Serviço',
    status: 'Concluído',
    fee: 0,
  },
  {
    id: 'tx-4',
    ref: 'SKB-TX-2025-08412',
    type: 'transfer_in',
    title: 'Transferência recebida',
    sub: 'De: João Pedro',
    recipient: 'João Pedro',
    account: 'SB-00000003',
    iban: 'AO06.0000.0003.0000.3214.7',
    amount: 12000,
    date: 'Ontem, 09:12',
    fullDate: '22/06/2025 09:12',
    isPositive: true,
    category: 'Transferência',
    status: 'Concluído',
    fee: 0,
  },
  {
    id: 'tx-5',
    ref: 'SKB-TX-2025-08101',
    type: 'loan',
    title: 'Empréstimo',
    sub: 'Aprovação de crédito',
    recipient: 'SkyBank Crédito Direto',
    account: 'SB-CREDIT-DESK',
    iban: 'AO06.0000.0000.CRED.IT01.0',
    amount: 100000,
    date: '21/06/2025',
    fullDate: '21/06/2025 10:00',
    isPositive: true,
    category: 'Crédito',
    status: 'Concluído',
    fee: 0,
  },
];

const INITIAL_LOANS = [
  {
    id: 'loan-1',
    code: 'SKB-LP-019',
    title: 'Empréstimo Pessoal',
    purpose: 'Equipamento de Trabalho',
    totalAmount: 100000,
    remainingAmount: 75000,
    paidAmount: 25000,
    percentage: 25,
    monthlyPayment: 12500,
    termMonths: 12,
    paidMonths: 2,
    nextDueDate: '10/07/2025',
    autoDebit: true,
    interestRate: 8.5,
    status: 'Ativo',
    startDate: '10/05/2025',
  },
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Depósito recebido',
    detail: '+ 50.000 Kz',
    time: 'Hoje, 14:32',
    icon: '📥',
    color: '#10b981',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Transferência enviada',
    detail: '- 5.000 Kz',
    time: 'Hoje, 10:15',
    icon: '⇄',
    color: '#0070f3',
    read: false,
  },
  {
    id: 'notif-3',
    title: 'Empréstimo aprovado',
    detail: '+ 100.000 Kz',
    time: 'Ontem, 18:45',
    icon: '📄',
    color: '#a855f7',
    read: false,
  },
  {
    id: 'notif-4',
    title: 'Atualização de nível',
    detail: 'Agora és Basic!',
    time: 'Ontem, 12:20',
    icon: '👑',
    color: '#f59e0b',
    read: true,
  },
];

export const BankProvider = ({ children }) => {
  const [user, setUser] = useState(INITIAL_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [showBalance, setShowBalance] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [loans, setLoans] = useState(INITIAL_LOANS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [toast, setToast] = useState(null);

  // Sync screen with URL hash if present
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (['dashboard', 'transferencias', 'emprestimos', 'login'].includes(hash)) {
        if (hash === 'login') {
          setIsAuthenticated(false);
          setCurrentScreen('login');
        } else {
          setIsAuthenticated(true);
          setCurrentScreen(hash);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    if (window.location.hash) {
      handleHashChange();
    }
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (screen) => {
    setCurrentScreen(screen);
    window.location.hash = screen;
  };

  const showToastNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const toggleShowBalance = () => {
    setShowBalance((prev) => !prev);
  };

  const makeTransfer = ({ recipientName, recipientAccount, recipientIban, amount, description, pin }) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return { success: false, message: 'Montante inválido.' };
    }
    if (numAmount > user.balance) {
      return { success: false, message: 'Saldo insuficiente na carteira.' };
    }
    if (!pin || pin.length < 4) {
      return { success: false, message: 'PIN da carteira de 4 dígitos obrigatório.' };
    }

    const newBalance = user.balance - numAmount;
    setUser((prev) => ({ ...prev, balance: newBalance }));

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const txRef = `SKB-TX-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const newTx = {
      id: `tx-${Date.now()}`,
      ref: txRef,
      type: 'transfer_out',
      title: 'Transferência enviada',
      sub: `Para: ${recipientName}`,
      recipient: recipientName,
      account: recipientAccount,
      iban: recipientIban || `AO06.0000.${recipientAccount.replace(/[^0-9]/g, '').padEnd(4, '0')}.0000.1234.9`,
      amount: numAmount,
      date: `Hoje, ${timeStr}`,
      fullDate: `${dateStr} ${timeStr}`,
      isPositive: false,
      category: 'Transferência',
      status: 'Concluído',
      description: description || 'Transferência entre contas SkyBank',
      fee: 0,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Add notification
    const newNotif = {
      id: `notif-${Date.now()}`,
      title: 'Transferência enviada',
      detail: `- ${numAmount.toLocaleString('pt-AO')} Kz`,
      time: `Hoje, ${timeStr}`,
      icon: '⇄',
      color: '#0070f3',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    showToastNotification(`Transferência de ${numAmount.toLocaleString('pt-AO')} Kz enviada com sucesso!`);

    return { success: true, transaction: newTx };
  };

  const applyForLoan = ({ amount, termMonths, purpose, pin }) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return { success: false, message: 'Montante inválido.' };
    }
    if (numAmount > user.creditLimit) {
      return { success: false, message: `O montante excede o limite do seu nível (${user.creditLimit.toLocaleString('pt-AO')} Kz).` };
    }
    if (!pin || pin.length < 4) {
      return { success: false, message: 'PIN de segurança de 4 dígitos obrigatório.' };
    }

    const interestRate = 8.5;
    const totalInterest = numAmount * (interestRate / 100) * (termMonths / 12);
    const totalToPay = numAmount + totalInterest;
    const monthlyPayment = Math.round(totalToPay / termMonths);

    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 10);
    const nextDueDateStr = `${String(nextMonth.getDate()).padStart(2, '0')}/${String(nextMonth.getMonth() + 1).padStart(2, '0')}/${nextMonth.getFullYear()}`;
    const code = `SKB-LP-${Math.floor(100 + Math.random() * 900)}`;

    const newLoan = {
      id: `loan-${Date.now()}`,
      code,
      title: `Empréstimo ${purpose || 'Pessoal'}`,
      purpose: purpose || 'Financiamento Pessoal',
      totalAmount: numAmount,
      remainingAmount: numAmount,
      paidAmount: 0,
      percentage: 0,
      monthlyPayment,
      termMonths,
      paidMonths: 0,
      nextDueDate: nextDueDateStr,
      autoDebit: true,
      interestRate,
      status: 'Ativo',
      startDate: `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`,
    };

    setLoans((prev) => [newLoan, ...prev]);

    // Credit user's wallet balance immediately
    const updatedBalance = user.balance + numAmount;
    setUser((prev) => ({ ...prev, balance: updatedBalance }));

    // Transaction record
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newTx = {
      id: `tx-${Date.now()}`,
      ref: `SKB-TX-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      type: 'loan',
      title: 'Crédito aprovado',
      sub: `${code} - Desembolso`,
      recipient: 'SkyBank Crédito Direto',
      account: 'SB-CREDIT',
      amount: numAmount,
      date: `Hoje, ${timeStr}`,
      fullDate: `${newLoan.startDate} ${timeStr}`,
      isPositive: true,
      category: 'Crédito',
      status: 'Concluído',
      fee: 0,
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Notification
    const newNotif = {
      id: `notif-${Date.now()}`,
      title: 'Empréstimo aprovado',
      detail: `+ ${numAmount.toLocaleString('pt-AO')} Kz`,
      time: `Hoje, ${timeStr}`,
      icon: '👑',
      color: '#10b981',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    showToastNotification(`Empréstimo de ${numAmount.toLocaleString('pt-AO')} Kz aprovado e creditado na sua carteira!`);

    return { success: true, loan: newLoan };
  };

  const payLoanInstallment = (loanId, amountToPay) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return { success: false, message: 'Empréstimo não encontrado.' };

    const payAmount = amountToPay || loan.monthlyPayment;
    if (payAmount > user.balance) {
      return { success: false, message: 'Saldo insuficiente para liquidar prestação.' };
    }

    const newRemaining = Math.max(0, loan.remainingAmount - payAmount);
    const newPaid = loan.paidAmount + payAmount;
    const newPercentage = Math.min(100, Math.round((newPaid / loan.totalAmount) * 100));

    setUser((prev) => ({ ...prev, balance: prev.balance - payAmount }));

    setLoans((prev) =>
      prev.map((l) =>
        l.id === loanId
          ? {
              ...l,
              remainingAmount: newRemaining,
              paidAmount: newPaid,
              percentage: newPercentage,
              paidMonths: l.paidMonths + 1,
              status: newRemaining === 0 ? 'Liquidado' : 'Ativo',
            }
          : l
      )
    );

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newTx = {
      id: `tx-${Date.now()}`,
      ref: `SKB-TX-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
      type: 'payment',
      title: 'Amortização de Empréstimo',
      sub: `${loan.code} - Parcela`,
      recipient: 'SkyBank Crédito',
      account: 'SB-CREDIT',
      amount: payAmount,
      date: `Hoje, ${timeStr}`,
      fullDate: `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${timeStr}`,
      isPositive: false,
      category: 'Crédito',
      status: 'Concluído',
      fee: 0,
    };
    setTransactions((prev) => [newTx, ...prev]);

    showToastNotification(`Prestação de ${payAmount.toLocaleString('pt-AO')} Kz liquidada com sucesso!`);
    return { success: true };
  };

  const toggleAutoDebit = (loanId) => {
    setLoans((prev) =>
      prev.map((l) => (l.id === loanId ? { ...l, autoDebit: !l.autoDebit } : l))
    );
    showToastNotification('Configuração de pagamento automático atualizada.');
  };

  const loginUser = (emailOrAccount, password) => {
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
    window.location.hash = 'dashboard';
    showToastNotification('Bem-vindo ao SkyBank!');
    return true;
  };

  const registerUser = (userData) => {
    const newAccountNum = `SB-0000${Math.floor(1000 + Math.random() * 9000)}`;
    const newIban = `AO06.0000.${Math.floor(1000 + Math.random() * 9000)}.0000.${Math.floor(1000 + Math.random() * 9000)}.1`;

    const newUser = {
      ...INITIAL_USER,
      name: userData.fullName || 'Novo Utilizador',
      shortName: (userData.fullName || 'Novo Utilizador').split(' ')[0],
      accountNumber: newAccountNum,
      iban: newIban,
      email: userData.email || 'utilizador@skybank.ao',
      phone: userData.phone || '+244 923 000 000',
      balance: 50000, // Welcome gift balance
      tier: 'Basic',
      tierIcon: '👑',
      creditLimit: 250000,
    };

    setUser(newUser);
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
    window.location.hash = 'dashboard';
    showToastNotification(`Conta criada com sucesso! Bónus inicial de 50.000 Kz creditado.`);
    return true;
  };

  const logoutUser = () => {
    setIsAuthenticated(false);
    setCurrentScreen('login');
    window.location.hash = 'login';
    showToastNotification('Sessão terminada com sucesso.');
  };

  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToastNotification('Todas as notificações foram marcadas como lidas.');
  };

  return (
    <BankContext.Provider
      value={{
        user,
        isAuthenticated,
        currentScreen,
        navigateTo,
        showBalance,
        toggleShowBalance,
        darkMode,
        setDarkMode,
        transactions,
        loans,
        notifications,
        makeTransfer,
        applyForLoan,
        payLoanInstallment,
        toggleAutoDebit,
        loginUser,
        registerUser,
        logoutUser,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        toast,
        showToastNotification,
      }}
    >
      {children}
    </BankContext.Provider>
  );
};

export const useBank = () => {
  const context = useContext(BankContext);
  if (!context) {
    throw new Error('useBank must be used within a BankProvider');
  }
  return context;
};
