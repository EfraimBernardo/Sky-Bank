import React, { useState } from 'react';
import Logo from '../../assets/ChatGPT Image 23_09_2026, 16_32_15.png';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useBank } from '../../contexts/BankContext';
import '../../styles/SkyBankShared.css';

export default function TransfersScreen() {
  const {
    user,
    transactions,
    makeTransfer,
    showToastNotification,
  } = useBank();

  // Tipo de transferência: 'skybank' (interna) ou 'iban' (outros bancos)
  const [transferType, setTransferType] = useState('skybank');

  // Contactos frequentes e directório de pesquisa SkyBank
  const frequentContacts = [
    {
      name: 'Maria Silva',
      account: 'SB-000000012',
      phone: '+244 912 345 678',
      email: 'maria.silva@email.ao',
      iban: 'AO06.0000.0012.0000.8492.1',
      avatar: '👩',
    },
    {
      name: 'João Pedro',
      account: 'SB-000000003',
      phone: '+244 934 567 890',
      email: 'joao.pedro@empresa.ao',
      iban: 'AO06.0000.0003.0000.3214.7',
      avatar: '👨',
    },
    {
      name: 'Ana Santos',
      account: 'SB-000000045',
      phone: '+244 925 112 233',
      email: 'ana.santos@consulting.ao',
      iban: 'AO06.0000.0045.0000.6721.4',
      avatar: '👩‍💼',
    },
    {
      name: 'Carlos Mendes',
      account: 'SB-000000088',
      phone: '+244 946 789 123',
      email: 'carlos.m@tecnologia.ao',
      iban: 'AO06.0000.0088.0000.9902.3',
      avatar: '👨‍💼',
    },
  ];

  const [searchRecipientQuery, setSearchRecipientQuery] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [recipientIban, setRecipientIban] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successReceipt, setSuccessReceipt] = useState(null);
  const [historyFilter, setHistoryFilter] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');

  const formatKz = (val) => {
    return Number(val).toLocaleString('pt-AO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleSelectContact = (contact) => {
    setRecipientName(contact.name);
    setRecipientAccount(contact.account);
    setRecipientIban(contact.iban);
    setSearchRecipientQuery(contact.name);
    setErrorMessage('');
  };

  const matchingContacts = frequentContacts.filter((c) => {
    if (!searchRecipientQuery.trim()) return false;
    const q = searchRecipientQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.account.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  const handleAddQuickAmount = (val) => {
    const current = parseFloat(amount) || 0;
    setAmount(String(current + val));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (user.status === 'Suspensa') {
      setErrorMessage('A sua conta está Suspensa. Durante o período de suspensão apenas é permitido consultar o saldo e receber dinheiro.');
      return;
    }

    if (user.status === 'Bloqueada' || user.status === 'Encerrada') {
      setErrorMessage(`Operação não permitida. A sua conta está no estado ${user.status}.`);
      return;
    }

    if (!recipientName.trim()) {
      setErrorMessage('Por favor, informe o nome do destinatário.');
      return;
    }

    if (transferType === 'skybank' && !recipientAccount.trim()) {
      setErrorMessage('Por favor, informe o número da conta SkyBank de destino.');
      return;
    }

    if (transferType === 'iban' && !recipientIban.trim()) {
      setErrorMessage('Por favor, informe o IBAN de destino.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Por favor, introduza um montante válido.');
      return;
    }

    // Regra oficial: Mínimo 200 Kz para todos os níveis
    if (numAmount < 200) {
      setErrorMessage('O valor mínimo por transferência é de 200 Kz para todos os níveis.');
      return;
    }

    if (numAmount > user.balance) {
      setErrorMessage(`Saldo insuficiente. O seu saldo disponível é de ${formatKz(user.balance)} Kz.`);
      return;
    }

    if (!pin || pin.length !== 4) {
      setErrorMessage('Digite o seu PIN de segurança da carteira (4 dígitos).');
      return;
    }

    const res = makeTransfer({
      recipientName,
      recipientAccount: transferType === 'skybank' ? recipientAccount : (recipientIban.slice(0, 14) + '...'),
      recipientIban: recipientIban || `AO06.0000.${recipientAccount.replace(/[^0-9]/g, '').padEnd(4, '0')}.0000.1234.9`,
      amount: numAmount,
      description: description || 'Transferência bancária',
      pin,
    });

    if (res.success) {
      setSuccessReceipt(res.transaction);
      // Limpa os campos
      setRecipientName('');
      setRecipientAccount('');
      setRecipientIban('');
      setAmount('');
      setDescription('');
      setPin('');
    } else {
      setErrorMessage(res.message);
    }
  };

  // Filtragem de histórico
  const filteredTransfers = transactions
    .filter((tx) => tx.type === 'transfer_out' || tx.type === 'transfer_in')
    .filter((tx) => {
      if (historyFilter === 'enviadas') return tx.type === 'transfer_out';
      if (historyFilter === 'recebidas') return tx.type === 'transfer_in';
      return true;
    })
    .filter((tx) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        tx.recipient?.toLowerCase().includes(term) ||
        tx.sub?.toLowerCase().includes(term) ||
        tx.ref?.toLowerCase().includes(term)
      );
    });

  return (
    <DashboardLayout activeTab="Transferências">
      {/* CABEÇALHO DA PÁGINA */}
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.pageTitle}>Transferências & Envios</h2>
          <p style={styles.pageSubtitle}>
            Transfira valores com confirmação por PIN, taxa zero entre contas SkyBank e comprovativo imediato.
          </p>
        </div>
      </div>

      {/* CARDS DE RESUMO SUPERIORES */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statLabel}>Saldo Disponível na Carteira</div>
          <div style={styles.statValue}>
            {formatKz(user.balance)} <span style={{ color: '#0070f3', fontSize: '18px' }}>Kz</span>
          </div>
          <div style={styles.statSub}>Conta: {user.accountNumber}</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statLabel}>Limite Diário de Transferência</div>
          <div style={styles.statValue}>
            500.000,00 <span style={{ color: '#10b981', fontSize: '18px' }}>Kz</span>
          </div>
          <div style={styles.statSub}>
            <span style={{ color: '#10b981' }}>Disponível hoje:</span> ~495.000,00 Kz
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statLabel}>Taxa SkyBank Interna</div>
          <div style={{ ...styles.statValue, color: '#10b981' }}>
            0,00 <span style={{ fontSize: '18px' }}>Kz</span>
          </div>
          <div style={styles.statSub}>100% gratuito e instantâneo</div>
        </div>
      </div>

      {/* GRID PRINCIPAL: FORMULÁRIO + DETALHES DE SEGURANÇA */}
      <div style={styles.mainGrid} className="sky-transfers-grid">
        
        {/* FORMULÁRIO DE TRANSFERÊNCIA */}
        <div style={styles.card}>
          <div style={styles.tabsHeader}>
            <button
              style={{
                ...styles.tabBtn,
                ...(transferType === 'skybank' ? styles.tabBtnActive : {}),
              }}
              onClick={() => {
                setTransferType('skybank');
                setErrorMessage('');
              }}
            >
              ⚡ Conta SkyBank (Instantâneo)
            </button>
            <button
              style={{
                ...styles.tabBtn,
                ...(transferType === 'iban' ? styles.tabBtnActive : {}),
              }}
              onClick={() => {
                setTransferType('iban');
                setErrorMessage('');
              }}
            >
              🏦 Outro Banco (IBAN)
            </button>
          </div>

          {/* PESQUISA DE DESTINATÁRIOS (TELEFONE, NOME, EMAIL OU CONTA) */}
          <div style={{ margin: '14px 0' }}>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
              🔍 Pesquisar destinatário por telefone, nome, email ou conta:
            </label>
            <input
              type="text"
              placeholder="Digite +244 9xx, nome, email ou SB-..."
              value={searchRecipientQuery}
              onChange={(e) => setSearchRecipientQuery(e.target.value)}
              style={styles.input}
            />

            {matchingContacts.length > 0 && (
              <div style={{ backgroundColor: '#0a152e', border: '1px solid rgba(0, 112, 243, 0.3)', borderRadius: '8px', marginTop: '6px', overflow: 'hidden' }}>
                {matchingContacts.map((c) => (
                  <div
                    key={c.account}
                    onClick={() => handleSelectContact(c)}
                    style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <div>
                      <strong style={{ fontSize: '12px', color: '#ffffff' }}>{c.name}</strong>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{c.account} • {c.phone} • {c.email}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#0070f3', fontWeight: 'bold' }}>Selecionar →</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CONTACTOS FREQUENTES */}
          <div style={{ margin: '10px 0 16px 0' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
              Destinatários frequentes:
            </span>
            <div style={styles.contactsRow}>
              {frequentContacts.map((c) => (
                <div
                  key={c.account}
                  style={styles.contactChip}
                  onClick={() => handleSelectContact(c)}
                  title={`Selecionar ${c.name}`}
                >
                  <span style={{ fontSize: '14px' }}>{c.avatar}</span>
                  <span style={{ fontSize: '12px', color: '#ffffff' }}>{c.name}</span>
                </div>
              ))}
            </div>
          </div>

          {errorMessage && (
            <div style={styles.errorAlert}>
              <span>⚠️</span>
              <span style={{ fontSize: '12px', color: '#ef4444' }}>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nome do Destinatário *</label>
              <input
                type="text"
                placeholder="Ex.: Maria Silva"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            {transferType === 'skybank' ? (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Número da Conta SkyBank *</label>
                <input
                  type="text"
                  placeholder="Ex.: SB-00000012"
                  value={recipientAccount}
                  onChange={(e) => setRecipientAccount(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            ) : (
              <div style={styles.inputGroup}>
                <label style={styles.label}>IBAN de Destino (21 dígitos) *</label>
                <input
                  type="text"
                  placeholder="Ex.: AO06.0040.0000.1234.5678.9"
                  value={recipientIban}
                  onChange={(e) => setRecipientIban(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            )}

            <div style={styles.inputGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label style={styles.label}>Montante da Transferência (Kz) *</label>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Saldo: {formatKz(user.balance)} Kz
                </span>
              </div>
              <input
                type="number"
                step="any"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={styles.input}
                required
              />

              {/* ATALHOS RÁPIDOS DE MONTANTE */}
              <div style={styles.quickAmountsRow}>
                <button
                  type="button"
                  style={styles.quickAmtBtn}
                  onClick={() => handleAddQuickAmount(2000)}
                >
                  +2.000 Kz
                </button>
                <button
                  type="button"
                  style={styles.quickAmtBtn}
                  onClick={() => handleAddQuickAmount(5000)}
                >
                  +5.000 Kz
                </button>
                <button
                  type="button"
                  style={styles.quickAmtBtn}
                  onClick={() => handleAddQuickAmount(10000)}
                >
                  +10.000 Kz
                </button>
                <button
                  type="button"
                  style={styles.quickAmtBtn}
                  onClick={() => handleAddQuickAmount(50000)}
                >
                  +50.000 Kz
                </button>
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Descrição / Motivo (Opcional)</label>
              <input
                type="text"
                placeholder="Ex.: Pagamento de serviços, almoço, adiantamento"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>PIN de Segurança da Carteira (4 dígitos) *</label>
              <div style={styles.passwordWrapper}>
                <input
                  type={showPin ? 'text' : 'password'}
                  placeholder="****"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                    setPin(val);
                  }}
                  style={styles.inputPassword}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  style={styles.eyeBtn}
                >
                  {showPin ? '🔒' : '👁️'}
                </button>
              </div>
              <span style={{ fontSize: '10px', color: '#64748b' }}>
                O seu código de autorização confidencial do SkyBank.
              </span>
            </div>

            <button type="submit" style={styles.btnPrimary}>
              Confirmar Transferência →
            </button>
          </form>
        </div>

        {/* LADO DIREITO: REGRAS DE SEGURANÇA E INFORMAÇÕES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <div style={styles.card}>
            <h3 style={styles.cardSectionTitle}>Segurança em Primeiro Lugar</h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.5', margin: '0 0 14px 0' }}>
              Todas as movimentações na plataforma SkyBank contam com validação criptográfica em tempo real e proteção de saldo.
            </p>

            <div style={styles.securityItem}>
              <div style={styles.securityIcon}>🔐</div>
              <div>
                <strong style={{ fontSize: '13px', color: '#ffffff' }}>Autorização por PIN</strong>
                <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Nenhuma transação é executada sem a digitação correta do teu PIN de 4 números.
                </p>
              </div>
            </div>

            <div style={styles.securityItem}>
              <div style={styles.securityIcon}>⚡</div>
              <div>
                <strong style={{ fontSize: '13px', color: '#ffffff' }}>Liquidação em Segundos</strong>
                <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Envios entre utilizadores SkyBank entram imediatamente na carteira de destino.
                </p>
              </div>
            </div>

            <div style={styles.securityItem}>
              <div style={styles.securityIcon}>🧾</div>
              <div>
                <strong style={{ fontSize: '13px', color: '#ffffff' }}>Comprovativo Digital Válido</strong>
                <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>
                  Cada envio gera uma referência auditável para partilha ou download.
                </p>
              </div>
            </div>
          </div>

          <div style={styles.bannerInfo}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={Logo} alt="SkyBank" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
              <div>
                <strong style={{ fontSize: '13px', color: '#ffffff' }}>Precisas de transferir mais?</strong>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                  Sobe de nível para <strong>Silver</strong> ou <strong>Gold</strong> e aumenta o teu limite para até 2.000.000 Kz por dia.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* SEÇÃO INFERIOR: HISTÓRICO RECENTE DE TRANSFERÊNCIAS */}
      <div style={{ ...styles.card, marginTop: '20px' }}>
        <div style={styles.historyHeader}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px' }}>Histórico de Transferências</h3>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Consulte e descarregue os recibos das tuas movimentações
            </span>
          </div>

          <div style={styles.historyFilters}>
            <input
              type="text"
              placeholder="Pesquisar por beneficiário ou ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />

            <div style={styles.filterBtns}>
              <button
                style={{
                  ...styles.pillFilterBtn,
                  ...(historyFilter === 'todas' ? styles.pillFilterActive : {}),
                }}
                onClick={() => setHistoryFilter('todas')}
              >
                Todas
              </button>
              <button
                style={{
                  ...styles.pillFilterBtn,
                  ...(historyFilter === 'enviadas' ? styles.pillFilterActive : {}),
                }}
                onClick={() => setHistoryFilter('enviadas')}
              >
                Enviadas
              </button>
              <button
                style={{
                  ...styles.pillFilterBtn,
                  ...(historyFilter === 'recebidas' ? styles.pillFilterActive : {}),
                }}
                onClick={() => setHistoryFilter('recebidas')}
              >
                Recebidas
              </button>
            </div>
          </div>
        </div>

        {/* LISTAGEM */}
        <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredTransfers.length > 0 ? (
            filteredTransfers.map((tx) => (
              <div
                key={tx.id}
                style={styles.transferRow}
                onClick={() => setSuccessReceipt(tx)}
                title="Clique para ver comprovativo completo"
              >
                <div
                  style={{
                    ...styles.txIconCircle,
                    color: tx.isPositive ? '#10b981' : '#0070f3',
                    backgroundColor: tx.isPositive ? 'rgba(16,185,129,0.15)' : 'rgba(0,112,243,0.15)',
                  }}
                >
                  {tx.isPositive ? '📥' : '⇄'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#ffffff' }}>
                    {tx.title} — {tx.recipient || tx.sub}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Ref: {tx.ref || 'SKB-TX-2025'} • {tx.fullDate || tx.date}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: tx.isPositive ? '#10b981' : '#ef4444',
                    }}
                  >
                    {tx.isPositive ? '+' : '-'} {formatKz(tx.amount)} Kz
                  </div>
                  <span style={{ fontSize: '11px', color: '#0070f3' }}>Ver comprovativo ›</span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b', fontSize: '13px' }}>
              Nenhuma transferência encontrada com os filtros selecionados.
            </div>
          )}
        </div>
      </div>

      {/* ================= MODAL DE COMPROVATIVO OFICIAL ================= */}
      {successReceipt && (
        <div style={styles.modalBackdrop} onClick={() => setSuccessReceipt(null)}>
          <div style={styles.receiptModal} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', borderBottom: '1px dashed rgba(20, 120, 178, 0.3)', paddingBottom: '16px' }}>
              <img src={Logo} alt="SkyBank" style={{ width: '45px', borderRadius: '50%' }} />
              <h3 style={{ margin: '8px 0 2px 0', fontSize: '18px', letterSpacing: '1px' }}>SKYBANK</h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
                Comprovativo Oficial de Transferência
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '18px 0' }}>
              <div style={styles.receiptRow}>
                <span style={styles.receiptLabel}>Referência Única:</span>
                <strong style={styles.receiptVal}>{successReceipt.ref}</strong>
              </div>
              <div style={styles.receiptRow}>
                <span style={styles.receiptLabel}>Origem:</span>
                <span style={styles.receiptVal}>{user.name} ({user.accountNumber})</span>
              </div>
              <div style={styles.receiptRow}>
                <span style={styles.receiptLabel}>Destinatário:</span>
                <span style={styles.receiptVal}>{successReceipt.recipient}</span>
              </div>
              <div style={styles.receiptRow}>
                <span style={styles.receiptLabel}>Conta / IBAN Destino:</span>
                <span style={styles.receiptVal}>{successReceipt.account || successReceipt.iban}</span>
              </div>
              <div style={styles.receiptRow}>
                <span style={styles.receiptLabel}>Data e Hora:</span>
                <span style={styles.receiptVal}>{successReceipt.fullDate || successReceipt.date}</span>
              </div>
              <div style={styles.receiptRow}>
                <span style={styles.receiptLabel}>Estado da Operação:</span>
                <span style={{ ...styles.receiptVal, color: '#10b981' }}>Liquidada com Sucesso ✓</span>
              </div>
              <div style={styles.receiptRow}>
                <span style={styles.receiptLabel}>Taxa de Serviço:</span>
                <span style={styles.receiptVal}>0,00 Kz (Isento)</span>
              </div>

              <div style={{ ...styles.receiptRow, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
                <span style={{ fontSize: '14px', color: '#ffffff', fontWeight: 'bold' }}>Montante:</span>
                <span style={{ fontSize: '18px', color: successReceipt.isPositive ? '#10b981' : '#0070f3', fontWeight: 'bold' }}>
                  {formatKz(successReceipt.amount)} Kz
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  showToastNotification('Comprovativo descarregado com sucesso.');
                  setSuccessReceipt(null);
                }}
                style={styles.btnPrimary}
              >
                Descarregar PDF (Simulado)
              </button>
              <button
                type="button"
                onClick={() => setSuccessReceipt(null)}
                style={styles.btnSecondary}
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}

// ESTILOS COM AS CORES OFICIAIS DO SKYBANK
const styles = {
  pageHeader: {
    marginBottom: '16px',
  },
  pageTitle: {
    fontSize: '20px',
    fontWeight: '700',
    margin: 0,
    color: '#ffffff',
  },
  pageSubtitle: {
    fontSize: '12px',
    color: '#64748b',
    margin: '4px 0 0 0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '14px',
    marginBottom: '18px',
  },
  statCard: {
    backgroundColor: '#071022',
    border: '1px solid rgba(20, 120, 178, 0.25)',
    borderRadius: '12px',
    padding: '16px',
    boxSizing: 'border-box',
  },
  statLabel: {
    fontSize: '11px',
    color: '#94a3b8',
    marginBottom: '6px',
  },
  statValue: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#ffffff',
  },
  statSub: {
    fontSize: '11px',
    color: '#64748b',
    marginTop: '4px',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1.6fr 1fr',
    gap: '16px',
  },
  card: {
    backgroundColor: '#071022',
    border: '1px solid rgba(20, 120, 178, 0.25)',
    borderRadius: '12px',
    padding: '20px',
    boxSizing: 'border-box',
  },
  tabsHeader: {
    display: 'flex',
    gap: '10px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    paddingBottom: '12px',
  },
  tabBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#94a3b8',
    borderRadius: '8px',
    padding: '10px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  tabBtnActive: {
    backgroundColor: '#0070f3',
    borderColor: '#0070f3',
    color: '#ffffff',
  },
  contactsRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  contactChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#0a162e',
    border: '1px solid rgba(20, 120, 178, 0.25)',
    borderRadius: '20px',
    padding: '6px 12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    padding: '10px 14px',
    marginBottom: '14px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    color: '#94a3b8',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#0a1429',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '11px 14px',
    color: '#ffffff',
    fontSize: '13px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  quickAmountsRow: {
    display: 'flex',
    gap: '6px',
    marginTop: '4px',
    flexWrap: 'wrap',
  },
  quickAmtBtn: {
    background: 'none',
    border: '1px solid rgba(0, 112, 243, 0.3)',
    color: '#38bdf8',
    borderRadius: '4px',
    padding: '3px 8px',
    fontSize: '10px',
    cursor: 'pointer',
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputPassword: {
    backgroundColor: '#0a1429',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '11px 14px',
    paddingRight: '42px',
    color: '#ffffff',
    fontSize: '13px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '14px',
  },
  btnPrimary: {
    backgroundColor: '#0070f3',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '13px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    flex: 1,
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    padding: '13px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    flex: 1,
  },
  cardSectionTitle: {
    fontSize: '15px',
    fontWeight: '600',
    margin: '0 0 8px 0',
    color: '#ffffff',
  },
  securityItem: {
    display: 'flex',
    gap: '12px',
    padding: '10px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  securityIcon: {
    fontSize: '18px',
    flexShrink: 0,
  },
  bannerInfo: {
    backgroundColor: '#071022',
    border: '1px solid rgba(20, 120, 178, 0.25)',
    borderRadius: '12px',
    padding: '16px',
    backgroundImage: 'radial-gradient(circle at right, rgba(0, 112, 243, 0.15), transparent)',
  },
  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '12px',
  },
  historyFilters: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  searchInput: {
    backgroundColor: '#0a1429',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    padding: '6px 12px',
    color: '#ffffff',
    fontSize: '12px',
    outline: 'none',
  },
  filterBtns: {
    display: 'flex',
    gap: '4px',
  },
  pillFilterBtn: {
    backgroundColor: '#0a1429',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#94a3b8',
    borderRadius: '20px',
    padding: '4px 10px',
    fontSize: '11px',
    cursor: 'pointer',
  },
  pillFilterActive: {
    backgroundColor: '#0070f3',
    borderColor: '#0070f3',
    color: '#ffffff',
  },
  transferRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '8px',
    backgroundColor: '#060d1d',
    border: '1px solid rgba(20, 120, 178, 0.15)',
    cursor: 'pointer',
  },
  txIconCircle: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    flexShrink: 0,
  },
  modalBackdrop: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 250,
    padding: '16px',
  },
  receiptModal: {
    backgroundColor: '#071022',
    border: '2px solid #0070f3',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '440px',
    padding: '24px',
    boxShadow: '0 20px 30px rgba(0, 112, 243, 0.25)',
  },
  receiptRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
  },
  receiptLabel: {
    color: '#94a3b8',
  },
  receiptVal: {
    color: '#ffffff',
    textAlign: 'right',
  },
};
