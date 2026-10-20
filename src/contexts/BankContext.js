import React, { createContext, useContext, useState, useEffect } from 'react';

const BankContext = createContext();

// Definição dos limites e regras oficiais por nível (Requisitos v1.0)
export const TIER_CONFIGS = {
  Mini: {
    name: 'Mini',
    ageRange: '12–14 anos',
    maxBalance: 200000,
    monthlyLimit: 50000,
    minTransfer: 200,
    canBorrow: false,
    minLoan: 0,
    maxLoan: 0,
    icon: '🐣',
    description: 'Conta para jovens dos 12 aos 14 anos com supervisão e autonomia protegida.',
  },
  Básica: {
    name: 'Básica',
    ageRange: 'A partir dos 15 anos',
    maxBalance: 500000,
    monthlyLimit: 100000,
    minTransfer: 200,
    canBorrow: true,
    minLoan: 50000,
    maxLoan: 150000,
    icon: '👑',
    description: 'Conta bancária digital padrão com acesso a microcrédito.',
  },
  Intermédia: {
    name: 'Intermédia',
    ageRange: 'Classificação por elegibilidade',
    maxBalance: 1000000,
    monthlyLimit: 200000,
    minTransfer: 200,
    canBorrow: true,
    minLoan: 200000,
    maxLoan: 500000,
    icon: '🥈',
    description: 'Conta expandida com maiores limites operacionais e de crédito.',
  },
  Completa: {
    name: 'Completa',
    ageRange: 'Classificação por elegibilidade',
    maxBalance: Infinity,
    monthlyLimit: 800000,
    minTransfer: 200,
    canBorrow: true,
    minLoan: 600000,
    maxLoan: 1000000,
    icon: '💎',
    description: 'Conta premium sem limite de saldo e limite de transações até 800.000 Kz/mês.',
  },
};

const INITIAL_USER = {
  id: 'usr-1',
  name: 'Efraim João Manuel Bernardo',
  shortName: 'Efraim João',
  accountNumber: 'SB-000000001',
  iban: 'AO06.0000.0001.0000.1234.5',
  balance: 162450.75,
  accountingBalance: 162450.75,
  cativoBalance: 0.0,
  monthlySpent: 12500, // Acumulado no mês corrente (Dias 1-30)
  tier: 'Básica',
  tierIcon: '👑',
  creditLimit: 150000,
  status: 'Activa', // 'Activa' | 'Suspensa' | 'Bloqueada' | 'Encerrada'
  suspensionCount: 0,
  blockCount: 0,
  email: 'efraim@skybank.ao',
  phone: '+244 923 456 789',
  birthDate: '2000-05-15',
  address: 'Benfica, Talatona, Luanda',
  province: 'Luanda',
  municipality: 'Talatona',
  documentType: 'Bilhete de Identidade',
  documentNumber: '00210034AB66',
  dailyTransferLimit: 1000000,
  dailyWithdrawLimit: 250000,
  twoFactorEnabled: true,
  biometricsEnabled: true,
  emailNotifications: true,
  smsNotifications: true,
  pin: '1234',
  password: 'password123',
  isAdmin: true,
  createdAt: '15/01/2025',
};

const INITIAL_CARDS = [
  {
    id: 'card-1',
    type: 'virtual',
    brand: 'Visa',
    name: 'Cartão Virtual SkyBank',
    number: '4532 •••• •••• 4892',
    fullNumber: '4532 8812 9043 4892',
    expiry: '09/29',
    cvv: '782',
    holder: 'Efraim João Manuel Bernardo',
    isBlocked: false,
    onlineEnabled: true,
    contactlessEnabled: true,
    dailyLimit: 350000,
    colorGradient: 'linear-gradient(135deg, #1e3a8a 0%, #0284c7 50%, #0f172a 100%)',
  },
  {
    id: 'card-2',
    type: 'physical',
    brand: 'Multicaixa',
    name: 'Cartão de Débito Multicaixa',
    number: '5061 •••• •••• 1204',
    fullNumber: '5061 2400 5192 1204',
    expiry: '12/28',
    cvv: '419',
    holder: 'Efraim João Manuel Bernardo',
    isBlocked: false,
    onlineEnabled: true,
    contactlessEnabled: true,
    dailyLimit: 500000,
    colorGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
  },
];

const INITIAL_TRANSACTIONS = [
  {
    id: 'tx-0',
    ref: 'SKB-BONUS-00001',
    type: 'deposit',
    title: 'Bónus de Abertura de Conta',
    sub: 'Boas-vindas ao SkyBank',
    recipient: 'Efraim João Manuel Bernardo',
    account: 'SB-000000001',
    amount: 20000,
    date: '15/01/2025',
    fullDate: '15/01/2025 10:00',
    isPositive: true,
    category: 'Bónus Inicial',
    status: 'Concluído',
    fee: 0,
  },
  {
    id: 'tx-1',
    ref: 'SKB-TX-2025-09142',
    type: 'transfer_out',
    title: 'Transferência enviada',
    sub: 'Para: Maria Silva',
    recipient: 'Maria Silva',
    account: 'SB-000000012',
    phone: '+244 912 345 678',
    email: 'maria.silva@email.ao',
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
    account: 'SB-000009999',
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
    account: 'SB-000000003',
    phone: '+244 934 567 890',
    email: 'joao.pedro@empresa.ao',
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
    title: 'Empréstimo concedido',
    sub: 'Crédito Nível Básica',
    recipient: 'SkyBank Crédito Direto',
    account: 'SB-CREDIT-DESK',
    iban: 'AO06.0000.0000.CRED.IT01.0',
    amount: 100000,
    date: '21/06/2025',
    fullDate: '21/06/2025 10:00',
    isPositive: true,
    category: 'Crédito',
    status: 'Concluído',
    fee: 2500,
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
    interestRate: 10.0, // 10% de juros
    openingFee: 2500, // 2.500 Kz taxa automática
    latePenalty: 5.0, // 5% penalização por atraso
    status: 'Ativo',
    startDate: '10/05/2025',
  },
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-0',
    title: 'Bónus de Abertura de Conta',
    detail: '+ 20.000 Kz creditado na tua carteira',
    time: '15/01/2025',
    icon: '🎉',
    color: '#10b981',
    read: true,
  },
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
    detail: '+ 100.000 Kz (Taxa: 2.500 Kz cobrada)',
    time: 'Ontem, 18:45',
    icon: '👑',
    color: '#a855f7',
    read: false,
  },
];

const INITIAL_ADMIN_USERS = [
  {
    id: 'usr-1',
    name: 'Efraim João Manuel Bernardo',
    email: 'efraim@skybank.ao',
    phone: '+244 923 456 789',
    accountNumber: 'SB-000000001',
    balance: 162450.75,
    tier: 'Básica',
    status: 'Activa',
    docNumber: '00210034AB66',
    registeredDate: '15/01/2025',
  },
  {
    id: 'usr-2',
    name: 'Maria Silva',
    email: 'maria.silva@email.ao',
    phone: '+244 912 345 678',
    accountNumber: 'SB-000000012',
    balance: 450000.0,
    tier: 'Intermédia',
    status: 'Activa',
    docNumber: '00329481LA01',
    registeredDate: '22/02/2025',
  },
  {
    id: 'usr-3',
    name: 'João Pedro',
    email: 'joao.pedro@empresa.ao',
    phone: '+244 934 567 890',
    accountNumber: 'SB-000000003',
    balance: 89000.0,
    tier: 'Básica',
    status: 'Activa',
    docNumber: '00891230HA77',
    registeredDate: '04/03/2025',
  },
  {
    id: 'usr-4',
    name: 'Mateus Júnior',
    email: 'mateus.jr@escola.ao',
    phone: '+244 991 223 344',
    accountNumber: 'SB-000000020',
    balance: 45000.0,
    tier: 'Mini',
    status: 'Activa',
    docNumber: '00981726MA33',
    registeredDate: '12/03/2025',
  },
  {
    id: 'usr-5',
    name: 'Ana Santos',
    email: 'ana.santos@consulting.ao',
    phone: '+244 925 112 233',
    accountNumber: 'SB-000000045',
    balance: 1250000.0,
    tier: 'Completa',
    status: 'Activa',
    docNumber: '00451928BA90',
    registeredDate: '10/01/2025',
  },
  {
    id: 'usr-6',
    name: 'Carlos Mendes',
    email: 'carlos.m@tecnologia.ao',
    phone: '+244 946 789 123',
    accountNumber: 'SB-000000088',
    balance: 15400.0,
    tier: 'Básica',
    status: 'Suspensa', // Conta suspensa para teste de restrições
    docNumber: '00192837CA44',
    registeredDate: '19/04/2025',
  },
];

const INITIAL_PENDING_LOANS = [
  {
    id: 'pend-1',
    userName: 'Carlos Mendes',
    accountNumber: 'SB-000000088',
    amount: 100000,
    termMonths: 12,
    purpose: 'Equipamento de Trabalho',
    requestedDate: 'Hoje, 09:15',
    riskScore: 'Médio (B)',
    tier: 'Básica',
  },
  {
    id: 'pend-2',
    userName: 'Maria Silva',
    accountNumber: 'SB-000000012',
    amount: 350000,
    termMonths: 18,
    purpose: 'Expansão Comercial',
    requestedDate: 'Ontem, 15:40',
    riskScore: 'Baixo (A+)',
    tier: 'Intermédia',
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
  const [cards, setCards] = useState(INITIAL_CARDS);
  const [adminUsers, setAdminUsers] = useState(INITIAL_ADMIN_USERS);
  const [pendingLoans, setPendingLoans] = useState(INITIAL_PENDING_LOANS);
  const [atmWithdrawals, setAtmWithdrawals] = useState([]);
  const [toast, setToast] = useState(null);

  // Sync screen com URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validScreens = [
        'dashboard',
        'transferencias',
        'emprestimos',
        'carteira',
        'pagamentos',
        'perfil',
        'admin',
        'login',
      ];
      if (validScreens.includes(hash)) {
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
    }, 4000);
  };

  const toggleShowBalance = () => {
    setShowBalance((prev) => !prev);
  };

  const getFormattedNow = () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    return { timeStr, dateStr, now };
  };

  // Obter limites do nível atual do utilizador
  const currentTierConfig = TIER_CONFIGS[user.tier] || TIER_CONFIGS.Básica;

  // ==================== TRANSFERÊNCIAS (Regras v1.0) ====================
  const makeTransfer = ({ recipientQuery, recipientName, recipientAccount, recipientIban, amount, description, pin }) => {
    // 1. Verificar estado da conta
    if (user.status === 'Suspensa') {
      return {
        success: false,
        message: 'A sua conta está Suspensa. Durante a suspensão apenas é permitido consultar o saldo e receber dinheiro.',
      };
    }
    if (user.status === 'Bloqueada' || user.status === 'Encerrada') {
      return {
        success: false,
        message: `Operação não permitida. A sua conta está no estado ${user.status}.`,
      };
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return { success: false, message: 'Montante inválido.' };
    }

    // Regra: Mínimo 200 Kz por transação
    if (numAmount < currentTierConfig.minTransfer) {
      return {
        success: false,
        message: `O valor mínimo por transação é de ${currentTierConfig.minTransfer.toLocaleString('pt-AO')} Kz.`,
      };
    }

    // Regra: Saldo suficiente
    if (numAmount > user.balance) {
      return { success: false, message: 'Saldo insuficiente na carteira.' };
    }

    // Regra: Limite mensal de movimentação (Dias 1 a 30)
    const newMonthlyTotal = (user.monthlySpent || 0) + numAmount;
    if (newMonthlyTotal > currentTierConfig.monthlyLimit) {
      return {
        success: false,
        message: `Esta operação excede o seu limite mensal de transações de ${currentTierConfig.monthlyLimit.toLocaleString('pt-AO')} Kz (Nível ${user.tier}). Já movimentou ${user.monthlySpent.toLocaleString('pt-AO')} Kz este mês.`,
      };
    }

    // Regra: PIN da carteira
    if (!pin || pin !== user.pin) {
      return { success: false, message: 'PIN da carteira incorreto.' };
    }

    // Debitar de forma consistente
    const newBalance = user.balance - numAmount;
    setUser((prev) => ({
      ...prev,
      balance: newBalance,
      accountingBalance: newBalance,
      monthlySpent: newMonthlyTotal,
    }));

    const { timeStr, dateStr, now } = getFormattedNow();
    const txRef = `SKB-TX-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newTx = {
      id: `tx-${Date.now()}`,
      ref: txRef,
      type: 'transfer_out',
      title: 'Transferência enviada',
      sub: `Para: ${recipientName || recipientQuery}`,
      recipient: recipientName || recipientQuery,
      account: recipientAccount || 'SB-EXTERNA',
      iban: recipientIban || `AO06.0000.${Math.floor(1000 + Math.random() * 9000)}.0000.1234.9`,
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

    // Notificação persistente
    const newNotif = {
      id: `notif-${Date.now()}`,
      title: 'Transferência enviada',
      detail: `- ${numAmount.toLocaleString('pt-AO')} Kz para ${recipientName || recipientQuery}`,
      time: `Hoje, ${timeStr}`,
      icon: '⇄',
      color: '#0070f3',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    showToastNotification(`Transferência de ${numAmount.toLocaleString('pt-AO')} Kz enviada com sucesso!`);

    return { success: true, transaction: newTx };
  };

  // ==================== PAGAMENTOS ====================
  const makePayment = ({
    serviceCategory,
    serviceName,
    entity,
    reference,
    amount,
    phoneNumber,
    clientNumber,
    description,
    pin,
  }) => {
    if (user.status === 'Suspensa') {
      return {
        success: false,
        message: 'A sua conta está Suspensa. Não é possível realizar pagamentos.',
      };
    }
    if (user.status === 'Bloqueada' || user.status === 'Encerrada') {
      return {
        success: false,
        message: `Conta no estado ${user.status}. Operação bloqueada.`,
      };
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 200) {
      return { success: false, message: 'Montante mínimo para pagamentos é de 200 Kz.' };
    }
    if (numAmount > user.balance) {
      return { success: false, message: 'Saldo insuficiente para efetuar o pagamento.' };
    }
    if (!pin || pin !== user.pin) {
      return { success: false, message: 'PIN de segurança incorreto.' };
    }

    const newBalance = user.balance - numAmount;
    setUser((prev) => ({
      ...prev,
      balance: newBalance,
      accountingBalance: newBalance,
      monthlySpent: (prev.monthlySpent || 0) + numAmount,
    }));

    const { timeStr, dateStr, now } = getFormattedNow();
    const txRef = `SKB-PAG-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    let rechargeToken = null;
    if (serviceCategory === 'energy' || serviceName?.toLowerCase().includes('ende')) {
      rechargeToken = `${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const newTx = {
      id: `tx-${Date.now()}`,
      ref: txRef,
      type: 'payment',
      title: `Pagamento: ${serviceName || 'Serviço'}`,
      sub: entity ? `Entidade: ${entity} | Ref: ${reference}` : `Ref: ${reference || phoneNumber || txRef}`,
      recipient: serviceName || 'Entidade Pagamentos',
      account: entity ? `Entidade ${entity}` : 'Multicaixa',
      iban: 'AO06.0040.0000.EMIS.MULT.ICAI.1',
      amount: numAmount,
      date: `Hoje, ${timeStr}`,
      fullDate: `${dateStr} ${timeStr}`,
      isPositive: false,
      category: serviceCategory || 'Pagamentos',
      status: 'Concluído',
      entity: entity || '00412',
      reference: reference || '982301948',
      rechargeToken,
      fee: 0,
    };

    setTransactions((prev) => [newTx, ...prev]);

    const newNotif = {
      id: `notif-${Date.now()}`,
      title: `Pagamento: ${serviceName || 'Serviço'}`,
      detail: `- ${numAmount.toLocaleString('pt-AO')} Kz`,
      time: `Hoje, ${timeStr}`,
      icon: '💳',
      color: '#06b6d4',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    showToastNotification(`Pagamento de ${numAmount.toLocaleString('pt-AO')} Kz efetuado com sucesso!`);

    return { success: true, transaction: newTx };
  };

  // ==================== DEPÓSITO DE FUNDOS ====================
  const depositFunds = ({ amount, method, reference }) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 200) {
      return { success: false, message: 'Montante mínimo de depósito é de 200 Kz.' };
    }

    // Verificar se não ultrapassa o limite de saldo do nível
    if (user.balance + numAmount > currentTierConfig.maxBalance) {
      return {
        success: false,
        message: `Este depósito excederia o limite máximo de saldo do seu nível (${currentTierConfig.maxBalance.toLocaleString('pt-AO')} Kz).`,
      };
    }

    const newBalance = user.balance + numAmount;
    setUser((prev) => ({
      ...prev,
      balance: newBalance,
      accountingBalance: newBalance,
    }));

    const { timeStr, dateStr, now } = getFormattedNow();
    const txRef = `SKB-DEP-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newTx = {
      id: `tx-${Date.now()}`,
      ref: txRef,
      type: 'deposit',
      title: 'Depósito em Carteira',
      sub: `Via ${method || 'Multicaixa Express'}`,
      recipient: user.name,
      account: user.accountNumber,
      iban: user.iban,
      amount: numAmount,
      date: `Hoje, ${timeStr}`,
      fullDate: `${dateStr} ${timeStr}`,
      isPositive: true,
      category: 'Depósito',
      status: 'Concluído',
      fee: 0,
    };

    setTransactions((prev) => [newTx, ...prev]);

    const newNotif = {
      id: `notif-${Date.now()}`,
      title: 'Depósito creditado',
      detail: `+ ${numAmount.toLocaleString('pt-AO')} Kz adicionado à carteira`,
      time: `Hoje, ${timeStr}`,
      icon: '📥',
      color: '#10b981',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    showToastNotification(`Depósito de ${numAmount.toLocaleString('pt-AO')} Kz adicionado com sucesso!`);

    return { success: true, transaction: newTx };
  };

  // ==================== LEVANTAMENTO SEM CARTÃO ====================
  const generateAtmCode = ({ amount, pin }) => {
    if (user.status === 'Suspensa' || user.status === 'Bloqueada') {
      return { success: false, message: `A sua conta está ${user.status}. Levantamentos indisponíveis.` };
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 1000) {
      return { success: false, message: 'Montante mínimo de levantamento ATM é 1.000 Kz.' };
    }
    if (numAmount > user.balance) {
      return { success: false, message: 'Saldo insuficiente.' };
    }
    if (!pin || pin !== user.pin) {
      return { success: false, message: 'PIN incorreto.' };
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const now = new Date();
    const expiry = new Date(now.getTime() + 30 * 60000);

    const newBalance = user.balance - numAmount;
    setUser((prev) => ({
      ...prev,
      balance: newBalance,
      cativoBalance: (prev.cativoBalance || 0) + numAmount,
    }));

    const atmRecord = {
      id: `atm-${Date.now()}`,
      code,
      amount: numAmount,
      createdAt: now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      expiresAt: expiry.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      status: 'Pendente no Multicaixa ATM',
    };

    setAtmWithdrawals((prev) => [atmRecord, ...prev]);

    const { timeStr, dateStr } = getFormattedNow();
    const newTx = {
      id: `tx-${Date.now()}`,
      ref: `SKB-ATM-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'atm_code',
      title: 'Código Levantamento ATM',
      sub: `Código: ${code} (Válido 30m)`,
      recipient: 'ATM Multicaixa',
      account: 'MULTICAIXA-ATM',
      amount: numAmount,
      date: `Hoje, ${timeStr}`,
      fullDate: `${dateStr} ${timeStr}`,
      isPositive: false,
      category: 'Levantamento',
      status: 'Pendente no ATM',
      fee: 0,
    };
    setTransactions((prev) => [newTx, ...prev]);

    showToastNotification(`Código de levantamento ${code} gerado com sucesso!`);
    return { success: true, atmRecord };
  };

  // ==================== EMPRÉSTIMOS (Regras Oficiais v1.0) ====================
  // Conta Mini NÃO pode solicitar empréstimos.
  // Básica: 50.000 a 150.000 Kz
  // Intermédia: 200.000 a 500.000 Kz
  // Completa: 600.000 a 1.000.000 Kz
  // Juros: 10%
  // Taxa automática: 2.500 Kz
  // Penalização por atraso: 5%
  const applyForLoan = ({ amount, termMonths, purpose, pin }) => {
    // Validação de estado da conta
    if (user.status !== 'Activa') {
      return {
        success: false,
        message: `Não é possível solicitar empréstimos. A sua conta está no estado ${user.status}.`,
      };
    }

    // Regra: Conta Mini não pode solicitar empréstimos
    if (user.tier === 'Mini' || !currentTierConfig.canBorrow) {
      return {
        success: false,
        message: 'A conta Mini (12–14 anos) não tem autorização para solicitar empréstimos.',
      };
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < currentTierConfig.minLoan || numAmount > currentTierConfig.maxLoan) {
      return {
        success: false,
        message: `Para o nível ${user.tier}, o valor de empréstimo deve estar entre ${currentTierConfig.minLoan.toLocaleString('pt-AO')} Kz e ${currentTierConfig.maxLoan.toLocaleString('pt-AO')} Kz.`,
      };
    }

    if (!pin || pin !== user.pin) {
      return { success: false, message: 'PIN de segurança incorreto.' };
    }

    // Encargos definidos: Juros 10%, Taxa automática 2.500 Kz
    const interestRate = 10.0;
    const openingFee = 2500;
    const totalInterest = numAmount * (interestRate / 100);
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
      remainingAmount: totalToPay,
      paidAmount: 0,
      percentage: 0,
      monthlyPayment,
      termMonths,
      paidMonths: 0,
      nextDueDate: nextDueDateStr,
      autoDebit: true,
      interestRate,
      openingFee,
      latePenalty: 5.0,
      status: 'Ativo',
      startDate: `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`,
    };

    setLoans((prev) => [newLoan, ...prev]);

    // O valor líquido creditado é o montante menos a taxa de abertura de 2.500 Kz
    const netCredited = numAmount - openingFee;
    const updatedBalance = user.balance + netCredited;
    setUser((prev) => ({
      ...prev,
      balance: updatedBalance,
      accountingBalance: updatedBalance,
    }));

    const { timeStr } = getFormattedNow();
    const newTx = {
      id: `tx-${Date.now()}`,
      ref: `SKB-TX-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'loan',
      title: 'Empréstimo aprovado',
      sub: `${code} (Desembolso líquido após taxa de 2.500 Kz)`,
      recipient: 'SkyBank Crédito Direto',
      account: 'SB-CREDIT',
      amount: netCredited,
      date: `Hoje, ${timeStr}`,
      fullDate: `${newLoan.startDate} ${timeStr}`,
      isPositive: true,
      category: 'Crédito',
      status: 'Concluído',
      fee: openingFee,
    };
    setTransactions((prev) => [newTx, ...prev]);

    const newNotif = {
      id: `notif-${Date.now()}`,
      title: 'Empréstimo concedido',
      detail: `+ ${netCredited.toLocaleString('pt-AO')} Kz creditado (Taxa: 2.500 Kz cobrada)`,
      time: `Hoje, ${timeStr}`,
      icon: '👑',
      color: '#10b981',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    showToastNotification(`Empréstimo de ${numAmount.toLocaleString('pt-AO')} Kz aprovado! Valor líquido creditado.`);

    return { success: true, loan: newLoan };
  };

  const payLoanInstallment = (loanId, amountToPay) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan) return { success: false, message: 'Empréstimo não encontrado.' };

    const payAmount = amountToPay || loan.monthlyPayment;
    if (payAmount > user.balance) {
      return { success: false, message: 'Saldo insuficiente para liquidar a prestação.' };
    }

    const newRemaining = Math.max(0, loan.remainingAmount - payAmount);
    const newPaid = loan.paidAmount + payAmount;
    const newPercentage = Math.min(100, Math.round((newPaid / loan.totalAmount) * 100));

    setUser((prev) => ({
      ...prev,
      balance: prev.balance - payAmount,
      accountingBalance: prev.accountingBalance - payAmount,
    }));

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

    const { timeStr, dateStr, now } = getFormattedNow();
    const newTx = {
      id: `tx-${Date.now()}`,
      ref: `SKB-TX-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'payment',
      title: 'Amortização de Empréstimo',
      sub: `${loan.code} - Parcela`,
      recipient: 'SkyBank Crédito',
      account: 'SB-CREDIT',
      amount: payAmount,
      date: `Hoje, ${timeStr}`,
      fullDate: `${dateStr} ${timeStr}`,
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

  // ==================== CARTÕES ====================
  const toggleCardLock = (cardId) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isBlocked: !c.isBlocked } : c))
    );
    showToastNotification('Estado do cartão atualizado.');
  };

  const toggleCardOnline = (cardId) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, onlineEnabled: !c.onlineEnabled } : c))
    );
  };

  const toggleCardContactless = (cardId) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, contactlessEnabled: !c.contactlessEnabled } : c))
    );
  };

  const updateCardLimit = (cardId, newLimit) => {
    const numLimit = parseFloat(newLimit);
    if (isNaN(numLimit) || numLimit <= 0) return;
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, dailyLimit: numLimit } : c))
    );
    showToastNotification('Limite do cartão atualizado.');
  };

  // ==================== PERFIL & SEGURANÇA ====================
  const updateUserProfile = (newData) => {
    setUser((prev) => ({
      ...prev,
      ...newData,
      shortName: newData.name ? newData.name.split(' ')[0] : prev.shortName,
    }));
    showToastNotification('Perfil atualizado com sucesso!');
    return { success: true };
  };

  const updateUserSecurity = ({ currentPassword, newPassword, currentPin, newPin }) => {
    if (newPassword) {
      if (currentPassword !== user.password) {
        return { success: false, message: 'Palavra-passe atual incorreta.' };
      }
      if (newPassword.length < 6) {
        return { success: false, message: 'A nova palavra-passe deve ter no mínimo 6 caracteres.' };
      }
      setUser((prev) => ({ ...prev, password: newPassword }));
      showToastNotification('Palavra-passe alterada!');
    }

    if (newPin) {
      if (currentPin !== user.pin) {
        return { success: false, message: 'PIN atual incorreto.' };
      }
      if (newPin.length !== 4) {
        return { success: false, message: 'O PIN deve ter 4 dígitos.' };
      }
      setUser((prev) => ({ ...prev, pin: newPin }));
      showToastNotification('PIN alterado com sucesso!');
    }

    return { success: true };
  };

  const updateUserLimits = ({ dailyTransferLimit, dailyWithdrawLimit }) => {
    setUser((prev) => ({
      ...prev,
      dailyTransferLimit: parseFloat(dailyTransferLimit) || prev.dailyTransferLimit,
      dailyWithdrawLimit: parseFloat(dailyWithdrawLimit) || prev.dailyWithdrawLimit,
    }));
    showToastNotification('Limites diários atualizados.');
    return { success: true };
  };

  const requestTierUpgrade = (targetTier) => {
    if (TIER_CONFIGS[targetTier]) {
      const cfg = TIER_CONFIGS[targetTier];
      setUser((prev) => ({
        ...prev,
        tier: targetTier,
        tierIcon: cfg.icon,
        creditLimit: cfg.maxLoan,
      }));
      showToastNotification(`Conta promovida para o nível ${targetTier}!`);
      return { success: true };
    }
    return { success: false, message: 'Nível inválido.' };
  };

  // ==================== ADMIN BACKOFFICE ====================
  const adminApproveLoan = (loanId) => {
    const loan = pendingLoans.find((l) => l.id === loanId);
    if (!loan) return;
    setPendingLoans((prev) => prev.filter((l) => l.id !== loanId));
    showToastNotification(`Crédito de ${loan.userName} (${loan.amount.toLocaleString('pt-AO')} Kz) APROVADO!`);
  };

  const adminRejectLoan = (loanId, reason) => {
    const loan = pendingLoans.find((l) => l.id === loanId);
    if (!loan) return;
    setPendingLoans((prev) => prev.filter((l) => l.id !== loanId));
    showToastNotification(`Crédito de ${loan.userName} RECUSADO (${reason || 'Critérios de risco'}).`);
  };

  const adminChangeUserStatus = (userId, nextStatus, reason) => {
    setAdminUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          showToastNotification(`Conta de ${u.name} alterada para o estado ${nextStatus}. Motivo: ${reason}`);
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
    // Se for o utilizador atual em sessão, sincronizar
    if (userId === user.id) {
      setUser((prev) => ({ ...prev, status: nextStatus }));
    }
  };

  const adminAdjustUserBalance = (userId, deltaAmount) => {
    setAdminUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newBal = Math.max(0, u.balance + deltaAmount);
          showToastNotification(`Saldo de ${u.name} ajustado com sucesso.`);
          return { ...u, balance: newBal };
        }
        return u;
      })
    );
  };

  // ==================== AUTENTICAÇÃO E REGISTO (Requisitos v1.0) ====================
  // Registo calcula a idade e atribui o nível (Mini se 12-14, Básica se 15+, etc.)
  // Bónus inicial de 20.000 Kz como transação própria
  // Formato da conta: SB-000000001
  const registerUser = (userData) => {
    let calculatedTier = 'Básica';
    let birthDate = userData.birthDate;
    if (birthDate) {
      const birthYear = new Date(birthDate).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;
      if (age >= 12 && age <= 14) {
        calculatedTier = 'Mini';
      } else if (age >= 15 && age < 18) {
        calculatedTier = 'Básica';
      } else if (age >= 18 && age < 25) {
        calculatedTier = 'Intermédia';
      } else if (age >= 25) {
        calculatedTier = 'Completa';
      }
    }

    const tierCfg = TIER_CONFIGS[calculatedTier] || TIER_CONFIGS.Básica;
    const randomNum = Math.floor(2 + Math.random() * 9999999);
    const newAccountNum = `SB-${String(randomNum).padStart(9, '0')}`;
    const newIban = `AO06.0000.${String(Math.floor(1000 + Math.random() * 9000))}.0000.${String(Math.floor(1000 + Math.random() * 9000))}.1`;

    const initialBonus = 20000; // Bónus oficial: 20.000 Kz

    const newUser = {
      ...INITIAL_USER,
      id: `usr-${Date.now()}`,
      name: userData.fullName || 'Novo Utilizador',
      shortName: (userData.fullName || 'Novo Utilizador').split(' ')[0],
      accountNumber: newAccountNum,
      iban: newIban,
      email: userData.email || 'utilizador@skybank.ao',
      phone: userData.phone || '+244 923 000 000',
      birthDate: userData.birthDate || '2000-01-01',
      balance: initialBonus,
      accountingBalance: initialBonus,
      monthlySpent: 0,
      tier: calculatedTier,
      tierIcon: tierCfg.icon,
      creditLimit: tierCfg.maxLoan,
      status: 'Activa',
      pin: userData.pin || '1234',
      password: userData.password || 'password123',
    };

    const bonusTx = {
      id: `tx-bonus-${Date.now()}`,
      ref: `SKB-BONUS-${Math.floor(10000 + Math.random() * 90000)}`,
      type: 'deposit',
      title: 'Bónus de Abertura de Conta',
      sub: 'Boas-vindas ao SkyBank',
      recipient: newUser.name,
      account: newAccountNum,
      amount: initialBonus,
      date: 'Hoje, agora',
      fullDate: `${new Date().toLocaleDateString('pt-PT')} ${new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`,
      isPositive: true,
      category: 'Bónus Inicial',
      status: 'Concluído',
      fee: 0,
    };

    const welcomeNotif = {
      id: `notif-welcome-${Date.now()}`,
      title: 'Bem-vindo ao SkyBank!',
      detail: `Conta criada no nível ${calculatedTier}. Bónus inicial de 20.000 Kz creditado.`,
      time: 'Agora',
      icon: '🎉',
      color: '#10b981',
      read: false,
    };

    setUser(newUser);
    setTransactions([bonusTx, ...transactions]);
    setNotifications([welcomeNotif, ...notifications]);
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
    window.location.hash = 'dashboard';
    showToastNotification(`Conta criada com sucesso! Bónus de 20.000 Kz creditado na carteira.`);
    return true;
  };

  const loginUser = (identifier, password) => {
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
    window.location.hash = 'dashboard';
    showToastNotification('Bem-vindo de volta ao SkyBank!');
    return true;
  };

  const logoutUser = () => {
    setIsAuthenticated(false);
    setCurrentScreen('login');
    window.location.hash = 'login';
    showToastNotification('Sessão terminada.');
  };

  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToastNotification('Todas as notificações marcadas como lidas.');
  };

  return (
    <BankContext.Provider
      value={{
        user,
        setUser,
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
        cards,
        currentTierConfig,
        toggleCardLock,
        toggleCardOnline,
        toggleCardContactless,
        updateCardLimit,
        atmWithdrawals,
        generateAtmCode,
        depositFunds,
        makeTransfer,
        makePayment,
        applyForLoan,
        payLoanInstallment,
        toggleAutoDebit,
        updateUserProfile,
        updateUserSecurity,
        updateUserLimits,
        requestTierUpgrade,
        adminUsers,
        pendingLoans,
        adminApproveLoan,
        adminRejectLoan,
        adminChangeUserStatus,
        adminAdjustUserBalance,
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
