import React, { useState } from 'react';
import Logo from '../../assets/ChatGPT Image 23_09_2026, 16_32_15.png';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useBank } from '../../contexts/BankContext';
import '../../styles/SkyBankShared.css';

export default function DashboardScreen() {
  const {
    user,
    showBalance,
    toggleShowBalance,
    transactions,
    loans,
    notifications,
    navigateTo,
    showToastNotification,
  } = useBank();

  // Modais interativos do Dashboard
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [allTxModalOpen, setAllTxModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [chartPeriod, setChartPeriod] = useState('7 dias');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportChat, setSupportChat] = useState([
    { sender: 'bot', text: 'Olá! Sou o assistente virtual do SkyBank. Como posso ajudar hoje?' },
  ]);

  const activeLoan = loans[0];

  const copyToClipboard = (text, label) => {
    navigator.clipboard?.writeText(text);
    showToastNotification(`${label} copiado!`);
  };

  const handleSendSupportMessage = (e) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    const userText = supportMessage;
    setSupportChat((prev) => [...prev, { sender: 'user', text: userText }]);
    setSupportMessage('');

    setTimeout(() => {
      setSupportChat((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Recebemos a tua mensagem! Um gestor de conta SkyBank entrará em contacto muito em breve através do teu email ou telefone.',
        },
      ]);
    }, 900);
  };

  // Formatação de valores Kz
  const formatKz = (val) => {
    return Number(val).toLocaleString('pt-AO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <DashboardLayout activeTab="Dashboard">
      {/* LAYOUT EM 3 COLUNAS */}
      <div style={styles.dashboardGrid} className="sky-dashboard-grid">
        
        {/* ================= COLUNA 1: DADOS FINANCEIROS PRINCIPAIS E GRÁFICO ================= */}
        <div style={styles.gridCol1} className="sky-col1">
          
          {/* SALDO PRINCIPAL */}
          <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={styles.cardLabelGroup}>
                  <span>Saldo disponível</span>
                  <button
                    onClick={toggleShowBalance}
                    style={styles.iconActionBtn}
                    title={showBalance ? 'Ocultar saldo' : 'Mostrar saldo'}
                  >
                    <EyeIcon hidden={!showBalance} />
                  </button>
                </div>

                <div style={styles.balanceValue}>
                  {showBalance ? (
                    <>
                      {formatKz(user.balance)}{' '}
                      <span style={{ color: '#0070f3', fontSize: '24px' }}>Kz</span>
                    </>
                  ) : (
                    '••••••••• Kz'
                  )}
                </div>

                <div style={styles.subBalance}>
                  Saldo total:{' '}
                  {showBalance ? `${formatKz(user.balance)} Kz` : '••••••••• Kz'}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={styles.growthBadge}>▲ +12,5%</span>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>este mês</span>
                <div style={{ marginTop: '10px' }}>
                  <svg width="100" height="30">
                    <path
                      d="M0,20 Q20,5 40,18 T80,10 T100,5"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* CARDS SECUNDÁRIOS DE INFORMAÇÃO */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }} className="sky-form-row">
              <div style={styles.infoBox}>
                <div style={styles.crownCircle}>{user.tierIcon || '👑'}</div>
                <div>
                  <span style={styles.infoBoxLabel}>Nível da conta</span>
                  <strong style={{ fontSize: '14px', color: '#ffffff' }}>
                    {user.tier} {user.tierIcon || '👑'}
                  </strong>
                </div>
              </div>

              <div
                style={{ ...styles.infoBox, cursor: 'pointer' }}
                onClick={() => copyToClipboard(user.accountNumber, 'Número da conta')}
                title="Clique para copiar"
              >
                <div style={{ flex: 1 }}>
                  <span style={styles.infoBoxLabel}>Número da conta</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ fontSize: '14px', color: '#ffffff' }}>{user.accountNumber}</strong>
                    <CopyIcon />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BOTÕES DE AÇÃO RÁPIDA */}
          <div style={styles.quickActionsGrid} className="sky-quick-actions">
            <button
              style={styles.actionBtn}
              onClick={() => navigateTo('transferencias')}
              title="Ir para transferências"
            >
              <div style={styles.actionCircle}>
                <ArrowRightIcon />
              </div>
              <strong style={styles.actionTitle}>Transferir</strong>
              <span style={styles.actionSub}>Enviar dinheiro</span>
            </button>

            <button
              style={styles.actionBtn}
              onClick={() => setReceiveModalOpen(true)}
              title="Ver dados para receber depósitos"
            >
              <div style={styles.actionCircle}>
                <ArrowDownIcon />
              </div>
              <strong style={styles.actionTitle}>Receber</strong>
              <span style={styles.actionSub}>Pedir dinheiro</span>
            </button>

            <button
              style={styles.actionBtn}
              onClick={() => navigateTo('emprestimos')}
              title="Solicitar empréstimo digital"
            >
              <div style={styles.actionCircle}>
                <CoinsIcon />
              </div>
              <strong style={styles.actionTitle}>Empréstimo</strong>
              <span style={styles.actionSub}>Solicitar agora</span>
            </button>

            <button
              style={styles.actionBtn}
              onClick={() => navigateTo('carteira')}
              title="Aceder à Carteira Digital"
            >
              <div style={styles.actionCircle}>
                <WalletIcon />
              </div>
              <strong style={styles.actionTitle}>Carteira</strong>
              <span style={styles.actionSub}>Saldos & Cartões</span>
            </button>
          </div>

          {/* GRÁFICO DE BARRAS DINÂMICO */}
          <div style={styles.card}>
            <div style={styles.cardHeaderRow}>
              <div>
                <h3 style={styles.cardTitle}>Movimentação financeira</h3>
                <span style={styles.cardSubTitle}>Entradas e saídas dos últimos {chartPeriod}</span>
              </div>
              <select
                style={styles.filterSelect}
                value={chartPeriod}
                onChange={(e) => setChartPeriod(e.target.value)}
              >
                <option value="7 dias">7 dias</option>
                <option value="15 dias">15 dias</option>
                <option value="30 dias">30 dias</option>
              </select>
            </div>

            <div style={styles.legendRow}>
              <span>
                <span style={{ color: '#10b981' }}>●</span> Entradas (+{chartPeriod === '30 dias' ? '185.000' : '82.000'} Kz)
              </span>
              <span>
                <span style={{ color: '#0070f3' }}>●</span> Saídas (-{chartPeriod === '30 dias' ? '64.500' : '20.500'} Kz)
              </span>
            </div>

            {/* Gráfico de Barras em SVG Responsivo */}
            <div style={{ marginTop: '10px' }}>
              <svg width="100%" height="110" viewBox="0 0 350 100">
                <line x1="0" y1="20" x2="350" y2="20" stroke="rgba(255,255,255,0.05)" />
                <line x1="0" y1="50" x2="350" y2="50" stroke="rgba(255,255,255,0.05)" />
                <line x1="0" y1="80" x2="350" y2="80" stroke="rgba(255,255,255,0.05)" />

                {/* Barras Pares: Verde (Entradas), Azul (Saídas) */}
                <rect x="35" y={chartPeriod === '30 dias' ? 25 : 40} width="8" height={chartPeriod === '30 dias' ? 55 : 40} fill="#10b981" rx="2" />
                <rect x="46" y="55" width="8" height="25" fill="#0070f3" rx="2" />

                <rect x="80" y="35" width="8" height="45" fill="#10b981" rx="2" />
                <rect x="91" y={chartPeriod === '15 dias' ? 40 : 50} width="8" height={chartPeriod === '15 dias' ? 40 : 30} fill="#0070f3" rx="2" />

                <rect x="125" y="20" width="8" height="60" fill="#10b981" rx="2" />
                <rect x="136" y="50" width="8" height="30" fill="#0070f3" rx="2" />

                <rect x="170" y="30" width="8" height="50" fill="#10b981" rx="2" />
                <rect x="181" y="45" width="8" height="35" fill="#0070f3" rx="2" />

                <rect x="215" y={chartPeriod === '30 dias' ? 30 : 38} width="8" height={chartPeriod === '30 dias' ? 50 : 42} fill="#10b981" rx="2" />
                <rect x="226" y="45" width="8" height="35" fill="#0070f3" rx="2" />

                <rect x="260" y="15" width="8" height="65" fill="#10b981" rx="2" />
                <rect x="271" y="50" width="8" height="30" fill="#0070f3" rx="2" />

                <rect x="305" y="25" width="8" height="55" fill="#10b981" rx="2" />
                <rect x="316" y="45" width="8" height="35" fill="#0070f3" rx="2" />
              </svg>
              <div style={styles.chartXAxis}>
                <span>17/06</span>
                <span>18/06</span>
                <span>19/06</span>
                <span>20/06</span>
                <span>21/06</span>
                <span>22/06</span>
                <span>23/06</span>
              </div>
            </div>
          </div>

          {/* BANNER INFERIOR */}
          <div style={styles.bannerContainer} className="sky-banner">
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '15px' }}>Sonhos também se planeiam.</h4>
              <p style={{ margin: '0 0 12px 0', fontSize: '11px', color: '#94a3b8' }}>
                Com o SkyBank, tens o apoio certo para construires o teu futuro.
              </p>
              <button
                style={styles.bannerBtn}
                onClick={() => navigateTo('emprestimos')}
              >
                Conhecer empréstimos →
              </button>
            </div>
            <img src={Logo} alt="Emblem" style={{ width: '55px', height: '55px', borderRadius: '50%' }} />
          </div>

        </div>

        {/* ================= COLUNA 2: CARTÃO DESTACADO E TRANSAÇÕES RECENTES ================= */}
        <div style={styles.gridCol2} className="sky-col2">
          
          {/* BANNER CARTÃO SKYBANK */}
          <div style={styles.cardSkyBank}>
            <div
              style={styles.cardGraphic3D}
              onClick={() => setCardModalOpen(true)}
              title="Ver detalhes do cartão virtual"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                <span style={{ letterSpacing: '1px' }}>SKY BANK</span>
                <span style={{ color: '#06B6D4' }}>✦ VIRTUAL</span>
              </div>
              <div style={styles.cardGraphicChip}></div>
              <div style={{ textAlign: 'center', fontWeight: 'bold', marginTop: '6px' }}>
                <img src={Logo} alt="Card Logo" style={{ width: '28px', borderRadius: '50%' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginTop: '6px' }}>
                <span style={{ fontFamily: 'monospace' }}>•••• 4892</span>
                <span>09/29</span>
              </div>
            </div>

            <h2 style={{ fontSize: '18px', margin: '14px 0 4px 0' }}>SkyBank Card</h2>
            <h3 style={{ fontSize: '14px', color: '#ffffff', margin: '0 0 8px 0' }}>
              Mais do que um banco, é o teu futuro.
            </h3>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 16px 0', lineHeight: '1.4' }}>
              Conquiste os seus objetivos com as nossas soluções financeiras simuladas.
            </p>
            <button
              style={styles.btnPill}
              onClick={() => setCardModalOpen(true)}
            >
              Gerir Cartão Virtual →
            </button>
          </div>

          {/* TRANSAÇÕES RECENTES */}
          <div style={{ ...styles.card, flex: 1 }}>
            <div style={styles.cardHeaderRow}>
              <h3 style={styles.cardTitle}>Transações recentes</h3>
              <button
                onClick={() => setAllTxModalOpen(true)}
                style={styles.linkButton}
              >
                Ver todas →
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
              {transactions.slice(0, 5).map((tx) => (
                <div
                  key={tx.id}
                  style={styles.txRow}
                  onClick={() => setSelectedTx(tx)}
                  title="Clique para ver comprovativo"
                >
                  <div
                    style={{
                      ...styles.txIconCircle,
                      color: tx.isPositive ? '#10b981' : '#0070f3',
                      backgroundColor: tx.isPositive ? 'rgba(16,185,129,0.15)' : 'rgba(0,112,243,0.15)',
                    }}
                  >
                    {tx.type === 'deposit'
                      ? '📥'
                      : tx.type === 'loan'
                      ? '👑'
                      : tx.type === 'payment'
                      ? '📄'
                      : '⇄'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={styles.txTitle}>{tx.title}</div>
                    <div style={styles.txSub}>{tx.sub}</div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div
                      style={{
                        color: tx.isPositive ? '#10b981' : '#ef4444',
                        fontWeight: '600',
                        fontSize: '13px',
                      }}
                    >
                      {tx.isPositive ? '+' : '-'} {formatKz(tx.amount)} Kz
                    </div>
                    <div style={styles.txTime}>{tx.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ================= COLUNA 3: NOTIFICAÇÕES, EMPRÉSTIMOS E SUPORTE ================= */}
        <div style={styles.gridCol3} className="sky-col3">
          
          {/* NOTIFICAÇÕES */}
          <div style={styles.card}>
            <div style={styles.cardHeaderRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BellIcon />
                <h3 style={styles.cardTitle}>Notificações</h3>
              </div>
              <button
                onClick={() => navigateTo('transferencias')}
                style={styles.linkButton}
              >
                Movimentos →
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              {notifications.slice(0, 4).map((notif) => (
                <div key={notif.id} style={styles.txRow}>
                  <div
                    style={{
                      ...styles.txIconCircle,
                      color: notif.color,
                      backgroundColor: `${notif.color}25`,
                    }}
                  >
                    {notif.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={styles.txTitle}>{notif.title}</div>
                    <div style={{ color: notif.color, fontSize: '11px', fontWeight: 'bold' }}>
                      {notif.detail}
                    </div>
                  </div>
                  <span style={styles.txTime}>{notif.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* EMPRÉSTIMOS ACTIVOS */}
          <div style={styles.card}>
            <div style={styles.cardHeaderRow}>
              <h3 style={styles.cardTitle}>Empréstimos activos</h3>
              <button
                onClick={() => navigateTo('emprestimos')}
                style={styles.linkButton}
              >
                Ver todos →
              </button>
            </div>

            {activeLoan ? (
              <div
                style={{ marginTop: '10px', cursor: 'pointer' }}
                onClick={() => navigateTo('emprestimos')}
                title="Gerir empréstimo"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ ...styles.txIconCircle, color: '#0070f3', backgroundColor: 'rgba(0,112,243,0.15)' }}>
                      🪙
                    </div>
                    <div>
                      <div style={styles.txTitle}>{activeLoan.title}</div>
                      <div style={styles.txSub}>Restante: {formatKz(activeLoan.remainingAmount)} Kz</div>
                    </div>
                  </div>
                  <strong style={{ fontSize: '13px', color: '#ffffff' }}>
                    {formatKz(activeLoan.totalAmount)} Kz ›
                  </strong>
                </div>

                <div style={styles.progressBarTrack}>
                  <div
                    style={{
                      ...styles.progressBarFill,
                      width: `${activeLoan.percentage}%`,
                    }}
                  ></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                  <span>Progresso de amortização</span>
                  <span>{activeLoan.percentage}%</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', marginTop: '8px' }}>
                  <span>Prazo: {activeLoan.paidMonths}/{activeLoan.termMonths} meses</span>
                  <span>Próxima: {activeLoan.nextDueDate}</span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0', color: '#64748b', fontSize: '12px' }}>
                Nenhum empréstimo ativo no momento.
              </div>
            )}
          </div>

          {/* BOX SUPORTE */}
          <div style={styles.supportBox}>
            <div style={styles.headsetCircle}>
              <HeadsetIcon />
            </div>
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: '13px', display: 'block', margin: '0 0 2px 0' }}>Precisa de ajuda?</strong>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 10px 0', lineHeight: '1.3' }}>
                A nossa equipa está sempre pronta para te atender.
              </p>
              <button
                style={styles.btnPill}
                onClick={() => setSupportModalOpen(true)}
              >
                Contactar suporte →
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ================= MODAL: RECEBER DINHEIRO (QR CODE + DADOS) ================= */}
      {receiveModalOpen && (
        <div style={styles.modalBackdrop} onClick={() => setReceiveModalOpen(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Dados Para Receber Transferências</h3>
              <button onClick={() => setReceiveModalOpen(false)} style={styles.modalCloseBtn}>✕</button>
            </div>

            <div style={{ textAlign: 'center', margin: '16px 0' }}>
              <div style={styles.qrCodeSimulated}>
                <div style={styles.qrPixelMatrix}>
                  <span style={{ fontSize: '26px' }}>📱</span>
                  <span style={{ fontSize: '10px', color: '#040914', fontWeight: 'bold' }}>SKYBANK PAY QR</span>
                </div>
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: '8px 0 0 0' }}>
                Mostre este QR code ou partilhe as suas coordenadas bancárias.
              </p>
            </div>

            <div style={styles.bankCoordsBox}>
              <div style={styles.coordItem}>
                <span style={styles.coordLabel}>Titular da Conta</span>
                <strong style={styles.coordVal}>{user.name}</strong>
              </div>
              <div style={styles.coordItem}>
                <span style={styles.coordLabel}>Número da Conta</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <strong style={styles.coordVal}>{user.accountNumber}</strong>
                  <button
                    onClick={() => copyToClipboard(user.accountNumber, 'Conta')}
                    style={styles.copySmallBtn}
                  >
                    Copiar
                  </button>
                </div>
              </div>
              <div style={styles.coordItem}>
                <span style={styles.coordLabel}>IBAN SkyBank</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <strong style={{ ...styles.coordVal, fontSize: '12px' }}>{user.iban}</strong>
                  <button
                    onClick={() => copyToClipboard(user.iban, 'IBAN')}
                    style={styles.copySmallBtn}
                  >
                    Copiar
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                copyToClipboard(
                  `Dados SkyBank:\nTitular: ${user.name}\nConta: ${user.accountNumber}\nIBAN: ${user.iban}`,
                  'Coordenadas completas'
                );
                setReceiveModalOpen(false);
              }}
              style={{ ...styles.btnPrimary, width: '100%', marginTop: '16px' }}
            >
              Copiar Todas as Coordenadas
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: DETALHES DA CARTEIRA ================= */}
      {walletModalOpen && (
        <div style={styles.modalBackdrop} onClick={() => setWalletModalOpen(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Visão Geral da Carteira Digital</h3>
              <button onClick={() => setWalletModalOpen(false)} style={styles.modalCloseBtn}>✕</button>
            </div>

            <div style={{ padding: '16px 0' }}>
              <div style={styles.walletHeaderCard}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Saldo Total Disponível</span>
                <h2 style={{ fontSize: '24px', margin: '4px 0 0 0', color: '#ffffff' }}>
                  {formatKz(user.balance)} <span style={{ color: '#0070f3' }}>Kz</span>
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                <div style={styles.walletStatRow}>
                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>Nível de Adesão:</span>
                  <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{user.tier} {user.tierIcon}</span>
                </div>
                <div style={styles.walletStatRow}>
                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>Limite de Empréstimo:</span>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>{formatKz(user.creditLimit)} Kz</span>
                </div>
                <div style={styles.walletStatRow}>
                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>Transferências Internas:</span>
                  <span style={{ color: '#0070f3', fontWeight: 'bold' }}>Gratuitas (Taxa 0 Kz)</span>
                </div>
                <div style={styles.walletStatRow}>
                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>Estado da Conta:</span>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>Ativa e Verificada ✓</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setWalletModalOpen(false);
                  navigateTo('transferencias');
                }}
                style={styles.btnPrimary}
              >
                Fazer Transferência
              </button>
              <button
                onClick={() => {
                  setWalletModalOpen(false);
                  navigateTo('emprestimos');
                }}
                style={styles.btnSecondary}
              >
                Linha de Crédito
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: COMPROVATIVO DE OPERAÇÃO ================= */}
      {selectedTx && (
        <div style={styles.modalBackdrop} onClick={() => setSelectedTx(null)}>
          <div style={styles.receiptCard} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', borderBottom: '1px dashed rgba(20, 120, 178, 0.3)', paddingBottom: '14px' }}>
              <img src={Logo} alt="SkyBank" style={{ width: '40px', borderRadius: '50%' }} />
              <h3 style={{ margin: '8px 0 2px 0', fontSize: '18px' }}>SKYBANK</h3>
              <p style={{ margin: 0, fontSize: '10px', color: '#64748b' }}>Comprovativo Oficial de Operação</p>
            </div>

            <div style={{ margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={styles.receiptRow}>
                <span style={styles.receiptLabel}>Ref. Operação:</span>
                <strong style={styles.receiptVal}>{selectedTx.ref || 'SKB-TX-2025-0012'}</strong>
              </div>
              <div style={styles.receiptRow}>
                <span style={styles.receiptLabel}>Tipo:</span>
                <span style={styles.receiptVal}>{selectedTx.title}</span>
              </div>
              <div style={styles.receiptRow}>
                <span style={styles.receiptLabel}>Beneficiário / Origem:</span>
                <span style={styles.receiptVal}>{selectedTx.recipient || selectedTx.sub}</span>
              </div>
              <div style={styles.receiptRow}>
                <span style={styles.receiptLabel}>Data e Hora:</span>
                <span style={styles.receiptVal}>{selectedTx.fullDate || selectedTx.date}</span>
              </div>
              <div style={styles.receiptRow}>
                <span style={styles.receiptLabel}>Estado:</span>
                <span style={{ ...styles.receiptVal, color: '#10b981' }}>{selectedTx.status || 'Concluído'} ✓</span>
              </div>
              <div style={styles.receiptRow}>
                <span style={styles.receiptLabel}>Taxa Cobrada:</span>
                <span style={styles.receiptVal}>0,00 Kz</span>
              </div>

              <div style={{ ...styles.receiptRow, marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
                <span style={{ fontSize: '14px', color: '#ffffff', fontWeight: 'bold' }}>Montante:</span>
                <span style={{ fontSize: '16px', color: selectedTx.isPositive ? '#10b981' : '#0070f3', fontWeight: 'bold' }}>
                  {selectedTx.isPositive ? '+' : '-'} {formatKz(selectedTx.amount)} Kz
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                onClick={() => {
                  showToastNotification('Comprovativo gerado para impressão.');
                  setSelectedTx(null);
                }}
                style={styles.btnPrimary}
              >
                Imprimir / PDF
              </button>
              <button
                onClick={() => setSelectedTx(null)}
                style={styles.btnSecondary}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: TODAS AS TRANSAÇÕES ================= */}
      {allTxModalOpen && (
        <div style={styles.modalBackdrop} onClick={() => setAllTxModalOpen(false)}>
          <div style={{ ...styles.modalCard, maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Histórico Completo de Transações</h3>
              <button onClick={() => setAllTxModalOpen(false)} style={styles.modalCloseBtn}>✕</button>
            </div>

            <div style={{ maxHeight: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', margin: '14px 0' }}>
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  style={styles.txRow}
                  onClick={() => {
                    setAllTxModalOpen(false);
                    setSelectedTx(tx);
                  }}
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
                  <div style={{ flex: 1 }}>
                    <div style={styles.txTitle}>{tx.title}</div>
                    <div style={styles.txSub}>{tx.sub} • {tx.date}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: tx.isPositive ? '#10b981' : '#ef4444', fontWeight: 'bold', fontSize: '13px' }}>
                      {tx.isPositive ? '+' : '-'} {formatKz(tx.amount)} Kz
                    </div>
                    <span style={{ fontSize: '10px', color: '#0070f3' }}>Ver recibo</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setAllTxModalOpen(false);
                navigateTo('transferencias');
              }}
              style={{ ...styles.btnPrimary, width: '100%' }}
            >
              Fazer Nova Transferência →
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: SUPORTE AO CLIENTE ================= */}
      {supportModalOpen && (
        <div style={styles.modalBackdrop} onClick={() => setSupportModalOpen(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HeadsetIcon />
                <h3 style={{ margin: 0, fontSize: '16px' }}>Apoio ao Cliente SkyBank 24/7</h3>
              </div>
              <button onClick={() => setSupportModalOpen(false)} style={styles.modalCloseBtn}>✕</button>
            </div>

            <div style={styles.chatBox}>
              {supportChat.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      ...styles.chatBubble,
                      backgroundColor: msg.sender === 'user' ? '#0070f3' : '#0e1a33',
                      color: '#ffffff',
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendSupportMessage} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Escreva a sua dúvida..."
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                style={styles.chatInput}
              />
              <button type="submit" style={styles.chatSendBtn}>
                Enviar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CARTÃO VIRTUAL SKYBANK ================= */}
      {cardModalOpen && (
        <div style={styles.modalBackdrop} onClick={() => setCardModalOpen(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Cartão Digital SkyBank Visa</h3>
              <button onClick={() => setCardModalOpen(false)} style={styles.modalCloseBtn}>✕</button>
            </div>

            <div style={{ margin: '16px 0' }}>
              {/* CARTÃO VIRTUAL GRÁFICO */}
              <div style={styles.virtualCardFront}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '14px', letterSpacing: '2px' }}>SKYBANK</span>
                  <span style={{ fontSize: '11px', color: '#06B6D4' }}>✦ CONTACTLESS</span>
                </div>
                <div style={styles.cardGraphicChip}></div>
                <div style={{ fontSize: '16px', fontFamily: 'monospace', letterSpacing: '3px', margin: '14px 0 6px 0' }}>
                  4532 •••• •••• 4892
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '11px' }}>
                  <div>
                    <span style={{ fontSize: '9px', color: '#94a3b8', display: 'block' }}>TITULAR</span>
                    <strong>{user.name}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '9px', color: '#94a3b8', display: 'block' }}>VALIDADE</span>
                    <strong>09/29</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                <div style={styles.walletStatRow}>
                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>Estado:</span>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>Desbloqueado e Ativo ✓</span>
                </div>
                <div style={styles.walletStatRow}>
                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>Compras Online:</span>
                  <span style={{ color: '#0070f3', fontWeight: 'bold' }}>Permitidas</span>
                </div>
                <div style={styles.walletStatRow}>
                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>Limite Diário:</span>
                  <span style={{ color: '#ffffff', fontWeight: 'bold' }}>200.000 Kz</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                showToastNotification('Cartão virtual pronto para compras seguras online.');
                setCardModalOpen(false);
              }}
              style={{ ...styles.btnPrimary, width: '100%' }}
            >
              Concluído
            </button>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}

// ICONES SVG AUXILIARES
const WalletIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M16 12h.01"/></svg>;
const CoinsIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="8" r="6"/><path d="M18 0a6 6 0 0 1 0 12"/></svg>;
const BellIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const EyeIcon = ({ hidden }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
    {hidden ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);
const CopyIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const ArrowRightIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
const ArrowDownIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>;
const HeadsetIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>;

// ESTILOS EXATOS PRESERVADOS DO DASHBOARD
const styles = {
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: '1.8fr 1.1fr 1.1fr',
    gap: '14px',
  },
  gridCol1: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  gridCol2: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  gridCol3: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  card: {
    backgroundColor: '#071022',
    border: '1px solid rgba(20, 120, 178, 0.25)',
    borderRadius: '12px',
    padding: '16px',
    boxSizing: 'border-box',
  },
  cardLabelGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#94a3b8',
  },
  iconActionBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
  },
  balanceValue: {
    fontSize: '28px',
    fontWeight: '800',
    margin: '4px 0',
  },
  subBalance: {
    fontSize: '11px',
    color: '#64748b',
  },
  growthBadge: {
    color: '#10b981',
    fontWeight: '700',
    fontSize: '12px',
  },
  infoBox: {
    flex: 1,
    backgroundColor: '#0a1429',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  crownCircle: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#0070f3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
  },
  infoBoxLabel: {
    fontSize: '10px',
    color: '#64748b',
    display: 'block',
  },
  quickActionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
  },
  actionBtn: {
    backgroundColor: '#071022',
    border: '1px solid rgba(20, 120, 178, 0.25)',
    borderRadius: '10px',
    padding: '12px 8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: '#ffffff',
    cursor: 'pointer',
  },
  actionCircle: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#0a162e',
    color: '#0070f3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '6px',
    border: '1px solid rgba(0, 112, 243, 0.2)',
  },
  actionTitle: {
    fontSize: '12px',
  },
  actionSub: {
    fontSize: '9px',
    color: '#64748b',
    marginTop: '2px',
  },
  cardHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  cardTitle: {
    fontSize: '13px',
    fontWeight: '600',
    margin: 0,
  },
  cardSubTitle: {
    fontSize: '10px',
    color: '#64748b',
  },
  filterSelect: {
    backgroundColor: '#0a1429',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    borderRadius: '6px',
    padding: '2px 8px',
    fontSize: '11px',
    cursor: 'pointer',
  },
  legendRow: {
    display: 'flex',
    gap: '12px',
    fontSize: '10px',
    color: '#94a3b8',
  },
  chartXAxis: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
    color: '#64748b',
    marginTop: '4px',
  },
  bannerContainer: {
    backgroundColor: '#071022',
    border: '1px solid rgba(20, 120, 178, 0.25)',
    borderRadius: '12px',
    padding: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundImage: 'radial-gradient(circle at right, rgba(0, 112, 243, 0.15), transparent)',
  },
  bannerBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #0070f3',
    color: '#0070f3',
    borderRadius: '20px',
    padding: '6px 12px',
    fontSize: '10px',
    cursor: 'pointer',
  },
  cardSkyBank: {
    backgroundColor: '#071022',
    border: '1px solid rgba(20, 120, 178, 0.25)',
    borderRadius: '12px',
    padding: '16px',
    backgroundImage: 'radial-gradient(circle at top right, rgba(0, 112, 243, 0.25), transparent)',
  },
  cardGraphic3D: {
    height: '110px',
    borderRadius: '8px',
    border: '1px solid rgba(0, 112, 243, 0.4)',
    padding: '10px',
    boxSizing: 'border-box',
    background: 'linear-gradient(135deg, #020b18 0%, #061838 100%)',
    boxShadow: 'inset 0 0 15px rgba(0, 112, 243, 0.3)',
    cursor: 'pointer',
  },
  cardGraphicChip: {
    width: '20px',
    height: '14px',
    border: '1px solid #0070f3',
    borderRadius: '2px',
    marginTop: '6px',
  },
  btnPill: {
    backgroundColor: 'transparent',
    border: '1px solid #0070f3',
    color: '#0070f3',
    borderRadius: '20px',
    padding: '6px 14px',
    fontSize: '11px',
    cursor: 'pointer',
    width: '100%',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#0070f3',
    fontSize: '11px',
    cursor: 'pointer',
    padding: 0,
  },
  txRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '4px 0',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  txIconCircle: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    flexShrink: 0,
  },
  txTitle: {
    fontSize: '12px',
    fontWeight: '500',
  },
  txSub: {
    fontSize: '10px',
    color: '#64748b',
  },
  txTime: {
    fontSize: '9px',
    color: '#64748b',
  },
  progressBarTrack: {
    height: '4px',
    backgroundColor: '#0a162e',
    borderRadius: '2px',
    overflow: 'hidden',
    marginTop: '10px',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0070f3',
  },
  supportBox: {
    backgroundColor: '#071022',
    border: '1px solid rgba(20, 120, 178, 0.25)',
    borderRadius: '12px',
    padding: '14px',
    display: 'flex',
    gap: '12px',
  },
  headsetCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#0a162e',
    color: '#0070f3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  btnPrimary: {
    backgroundColor: '#0070f3',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    flex: 1,
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    flex: 1,
  },
  /* MODAIS */
  modalBackdrop: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    padding: '16px',
  },
  modalCard: {
    backgroundColor: '#071022',
    border: '1px solid rgba(20, 120, 178, 0.3)',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '460px',
    padding: '20px',
    boxShadow: '0 20px 30px rgba(0, 0, 0, 0.5)',
  },
  receiptCard: {
    backgroundColor: '#071022',
    border: '2px solid #0070f3',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '420px',
    padding: '24px',
    boxShadow: '0 20px 30px rgba(0, 112, 243, 0.2)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '12px',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: '18px',
    cursor: 'pointer',
  },
  qrCodeSimulated: {
    width: '130px',
    height: '130px',
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    margin: '0 auto',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrPixelMatrix: {
    width: '100%',
    height: '100%',
    border: '3px solid #040914',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  },
  bankCoordsBox: {
    backgroundColor: '#0a1429',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  coordItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  coordLabel: {
    fontSize: '10px',
    color: '#64748b',
  },
  coordVal: {
    fontSize: '13px',
    color: '#ffffff',
  },
  copySmallBtn: {
    background: 'rgba(0, 112, 243, 0.15)',
    border: '1px solid #0070f3',
    color: '#0070f3',
    borderRadius: '4px',
    padding: '2px 8px',
    fontSize: '10px',
    cursor: 'pointer',
  },
  walletHeaderCard: {
    backgroundColor: '#0a1429',
    border: '1px solid rgba(0, 112, 243, 0.3)',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
  },
  walletStatRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
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
  chatBox: {
    height: '200px',
    overflowY: 'auto',
    backgroundColor: '#050c1a',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    margin: '14px 0',
  },
  chatBubble: {
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    maxWidth: '80%',
    lineHeight: '1.4',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#0a1429',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '10px 12px',
    color: '#ffffff',
    fontSize: '12px',
    outline: 'none',
  },
  chatSendBtn: {
    backgroundColor: '#0070f3',
    border: 'none',
    color: '#ffffff',
    borderRadius: '8px',
    padding: '0 16px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  virtualCardFront: {
    height: '160px',
    borderRadius: '12px',
    border: '1px solid rgba(0, 112, 243, 0.5)',
    padding: '16px',
    background: 'linear-gradient(135deg, #061533 0%, #0a2558 100%)',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.6), inset 0 0 15px rgba(0, 112, 243, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
};