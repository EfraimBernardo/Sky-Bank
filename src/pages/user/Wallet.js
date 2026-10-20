import React, { useState } from 'react';
import Logo from '../../assets/ChatGPT Image 23_09_2026, 16_32_15.png';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useBank } from '../../contexts/BankContext';
import '../../styles/SkyBankShared.css';

export default function WalletScreen() {
  const {
    user,
    showBalance,
    toggleShowBalance,
    transactions,
    cards,
    toggleCardLock,
    toggleCardOnline,
    toggleCardContactless,
    updateCardLimit,
    depositFunds,
    generateAtmCode,
    showToastNotification,
  } = useBank();

  // Estados dos modais e filtros
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [cardPinInput, setCardPinInput] = useState('');
  const [cardPinModalOpen, setCardPinModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('25000');
  const [depositMethod, setDepositMethod] = useState('Multicaixa Express');
  const [atmModalOpen, setAtmModalOpen] = useState(false);
  const [atmAmount, setAtmAmount] = useState('10000');
  const [atmPin, setAtmPin] = useState('');
  const [atmResult, setAtmResult] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);
  const [txTypeFilter, setTxTypeFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [newLimitValue, setNewLimitValue] = useState('');

  const currentCard = cards[activeCardIndex] || cards[0];

  const formatKz = (val) => {
    return Number(val || 0).toLocaleString('pt-AO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard?.writeText(text);
    showToastNotification(`${label} copiado!`);
  };

  const handleRevealCardDetails = (e) => {
    e.preventDefault();
    if (cardPinInput === user.pin) {
      setShowCardDetails(true);
      setCardPinModalOpen(false);
      setCardPinInput('');
      showToastNotification('Dados do cartão revelados.');
    } else {
      showToastNotification('PIN incorreto.', 'error');
    }
  };

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(depositAmount);
    if (isNaN(num) || num <= 0) {
      showToastNotification('Introduza um montante válido.', 'error');
      return;
    }
    depositFunds({
      amount: num,
      method: depositMethod,
      reference: `MCX-${Math.floor(100000 + Math.random() * 900000)}`,
    });
    setDepositModalOpen(false);
  };

  const handleAtmWithdrawSubmit = (e) => {
    e.preventDefault();
    const res = generateAtmCode({
      amount: atmAmount,
      pin: atmPin,
    });
    if (res.success) {
      setAtmResult(res.atmRecord);
      setAtmPin('');
    } else {
      showToastNotification(res.message, 'error');
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      (tx.title && tx.title.toLowerCase().includes(searchFilter.toLowerCase())) ||
      (tx.sub && tx.sub.toLowerCase().includes(searchFilter.toLowerCase())) ||
      (tx.ref && tx.ref.toLowerCase().includes(searchFilter.toLowerCase()));

    if (!matchesSearch) return false;

    if (txTypeFilter === 'all') return true;
    if (txTypeFilter === 'in') return tx.isPositive;
    if (txTypeFilter === 'out') return !tx.isPositive;
    if (txTypeFilter === 'payment') return tx.type === 'payment';
    if (txTypeFilter === 'deposit') return tx.type === 'deposit';
    return true;
  });

  return (
    <DashboardLayout activeTab="Carteira">
      <div style={styles.container}>
        {/* TOPO: CABEÇALHO DA CARTEIRA */}
        <div style={styles.headerBanner}>
          <div>
            <span style={styles.badgeTop}>CARTEIRA DIGITAL & CARTÕES</span>
            <h1 style={styles.pageTitle}>A tua Carteira SkyBank</h1>
            <p style={styles.pageSubtitle}>
              Gere os teus saldos, cartões de débito, depósitos e levantamentos Multicaixa sem cartão.
            </p>
          </div>
          <div style={styles.bannerActions}>
            <button
              onClick={() => setDepositModalOpen(true)}
              style={styles.btnPrimary}
            >
              <span>+</span> Depositar Fundos
            </button>
            <button
              onClick={() => {
                setAtmResult(null);
                setAtmModalOpen(true);
              }}
              style={styles.btnSecondary}
            >
              <span>🏧</span> Levantar no ATM
            </button>
          </div>
        </div>

        {/* GRADE PRINCIPAL: SALDOS E CARTÕES */}
        <div style={styles.mainGrid}>
          {/* COLUNA ESQUERDA: VISÃO DE SALDOS E LIMITES */}
          <div style={styles.leftCol}>
            {/* CARD DE SALDO TOTAL */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <span style={styles.labelMuted}>Saldo Disponível</span>
                  <div style={styles.balanceBig}>
                    {showBalance ? (
                      <>
                        {formatKz(user.balance)}{' '}
                        <span style={{ color: '#0070f3', fontSize: '22px' }}>Kz</span>
                      </>
                    ) : (
                      '••••••••• Kz'
                    )}
                  </div>
                </div>
                <button
                  onClick={toggleShowBalance}
                  style={styles.btnGhost}
                  title={showBalance ? 'Ocultar' : 'Mostrar'}
                >
                  {showBalance ? '👁️' : '🙈'}
                </button>
              </div>

              {/* DETALHES CONTABILÍSTICOS */}
              <div style={styles.balanceSplitGrid}>
                <div style={styles.balanceSubBox}>
                  <span style={styles.subBoxLabel}>Saldo Contabilístico</span>
                  <strong style={styles.subBoxVal}>
                    {showBalance ? `${formatKz(user.accountingBalance || user.balance)} Kz` : '•••••'}
                  </strong>
                </div>
                <div style={styles.balanceSubBox}>
                  <span style={styles.subBoxLabel}>Saldo Retido / Cativo</span>
                  <strong style={{ ...styles.subBoxVal, color: '#f59e0b' }}>
                    {showBalance ? `${formatKz(user.cativoBalance || 0)} Kz` : '•••••'}
                  </strong>
                </div>
              </div>

              {/* COORDENADAS BANCÁRIAS RÁPIDAS */}
              <div style={styles.coordsCard}>
                <div style={styles.coordsRow}>
                  <div>
                    <span style={styles.coordLabel}>Número da Conta</span>
                    <strong style={styles.coordVal}>{user.accountNumber}</strong>
                  </div>
                  <button
                    onClick={() => copyToClipboard(user.accountNumber, 'Conta')}
                    style={styles.copyBtn}
                  >
                    Copiar
                  </button>
                </div>
                <div style={{ ...styles.coordsRow, marginTop: '8px' }}>
                  <div>
                    <span style={styles.coordLabel}>IBAN SkyBank Angola</span>
                    <strong style={{ ...styles.coordVal, fontSize: '12px' }}>{user.iban}</strong>
                  </div>
                  <button
                    onClick={() => copyToClipboard(user.iban, 'IBAN')}
                    style={styles.copyBtn}
                  >
                    Copiar
                  </button>
                </div>
              </div>
            </div>

            {/* LIMITES OPERACIONAIS DIÁRIOS */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardHeading}>Limites Operacionais</h3>
                <span style={styles.tierTag}>{user.tier} {user.tierIcon}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
                <div>
                  <div style={styles.limitHeader}>
                    <span>Transferências Diárias</span>
                    <strong>{formatKz(user.dailyTransferLimit || 1000000)} Kz</strong>
                  </div>
                  <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: '35%', backgroundColor: '#0070f3' }} />
                  </div>
                </div>

                <div>
                  <div style={styles.limitHeader}>
                    <span>Levantamentos ATM / Dia</span>
                    <strong>{formatKz(user.dailyWithdrawLimit || 250000)} Kz</strong>
                  </div>
                  <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: '20%', backgroundColor: '#10b981' }} />
                  </div>
                </div>

                <div>
                  <div style={styles.limitHeader}>
                    <span>Crédito Pré-Aprovado</span>
                    <strong style={{ color: '#06b6d4' }}>{formatKz(user.creditLimit)} Kz</strong>
                  </div>
                  <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: '100%', backgroundColor: '#06b6d4' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: GESTÃO DE CARTÕES VIRTUAIS & FÍSICOS */}
          <div style={styles.rightCol}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardHeading}>Os Teus Cartões</h3>
                <div style={styles.cardSelector}>
                  {cards.map((c, idx) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setActiveCardIndex(idx);
                        setShowCardDetails(false);
                      }}
                      style={{
                        ...styles.cardSelectorTab,
                        ...(activeCardIndex === idx ? styles.cardSelectorTabActive : {}),
                      }}
                    >
                      {c.brand}
                    </button>
                  ))}
                </div>
              </div>

              {/* CARD FÍSICO / VIRTUAL EMBEDDED */}
              <div
                style={{
                  ...styles.creditCardVisual,
                  background: currentCard.colorGradient,
                  opacity: currentCard.isBlocked ? 0.6 : 1,
                  filter: currentCard.isBlocked ? 'grayscale(0.8)' : 'none',
                }}
              >
                <div style={styles.cardTopRow}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={styles.cardBankLogo}>SKYBANK</span>
                    <span style={styles.cardTypeBadge}>
                      {currentCard.type === 'virtual' ? 'VIRTUAL' : 'MULTICAIXA'}
                    </span>
                  </div>
                  <span style={styles.contactlessSymbol}>✦ 📡</span>
                </div>

                <div style={styles.cardChip}>
                  <div style={styles.chipInner} />
                </div>

                <div style={styles.cardNumberDisplay}>
                  {showCardDetails
                    ? currentCard.fullNumber
                    : currentCard.number}
                </div>

                <div style={styles.cardBottomRow}>
                  <div>
                    <span style={styles.cardTinyLabel}>TITULAR</span>
                    <span style={styles.cardHolderName}>{currentCard.holder}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={styles.cardTinyLabel}>VALIDADE</span>
                    <span style={styles.cardExpiry}>{currentCard.expiry}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={styles.cardTinyLabel}>CVV</span>
                    <span style={styles.cardCvv}>
                      {showCardDetails ? currentCard.cvv : '•••'}
                    </span>
                  </div>
                </div>

                {currentCard.isBlocked && (
                  <div style={styles.cardBlockedOverlay}>
                    <span>🔒 CARTÃO BLOQUEADO</span>
                  </div>
                )}
              </div>

              {/* AÇÕES E TOGGLES DO CARTÃO */}
              <div style={styles.cardActionsRow}>
                <button
                  onClick={() => {
                    if (showCardDetails) {
                      setShowCardDetails(false);
                    } else {
                      setCardPinModalOpen(true);
                    }
                  }}
                  style={styles.cardControlBtn}
                >
                  <span>{showCardDetails ? '🙈 Ocultar Dados' : '👁️ Ver Dados & CVV'}</span>
                </button>

                <button
                  onClick={() => toggleCardLock(currentCard.id)}
                  style={{
                    ...styles.cardControlBtn,
                    borderColor: currentCard.isBlocked ? '#10b981' : '#ef4444',
                    color: currentCard.isBlocked ? '#10b981' : '#ef4444',
                  }}
                >
                  <span>{currentCard.isBlocked ? '🔓 Desbloquear' : '🔒 Bloquear'}</span>
                </button>

                <button
                  onClick={() => {
                    setNewLimitValue(String(currentCard.dailyLimit));
                    setLimitModalOpen(true);
                  }}
                  style={styles.cardControlBtn}
                >
                  <span>⚙️ Ajustar Limite</span>
                </button>
              </div>

              {/* SWITCHES DE FUNCIONALIDADES */}
              <div style={styles.cardSettingsList}>
                <div style={styles.cardSettingItem}>
                  <div>
                    <strong style={styles.settingTitle}>Compras na Internet</strong>
                    <p style={styles.settingDesc}>Autorizar pagamentos online nacionais e internacionais</p>
                  </div>
                  <label style={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={currentCard.onlineEnabled}
                      onChange={() => toggleCardOnline(currentCard.id)}
                    />
                    <span style={styles.toggleSlider}></span>
                  </label>
                </div>

                <div style={styles.cardSettingItem}>
                  <div>
                    <strong style={styles.settingTitle}>Pagamentos Contactless (NFC)</strong>
                    <p style={styles.settingDesc}>Pagar em TPA por aproximação sem inserir o cartão</p>
                  </div>
                  <label style={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={currentCard.contactlessEnabled}
                      onChange={() => toggleCardContactless(currentCard.id)}
                    />
                    <span style={styles.toggleSlider}></span>
                  </label>
                </div>

                <div style={styles.cardSettingItem}>
                  <div>
                    <strong style={styles.settingTitle}>Limite Diário do Cartão</strong>
                    <p style={styles.settingDesc}>Teto máximo de despesas diárias neste cartão</p>
                  </div>
                  <span style={styles.limitCurrentTag}>
                    {formatKz(currentCard.dailyLimit)} Kz
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= SECÇÃO: EXTRATO COMPLETO DE MOVIMENTOS ================= */}
        <div style={{ ...styles.card, marginTop: '20px' }}>
          <div style={styles.statementHeader}>
            <div>
              <h3 style={styles.cardHeading}>Extrato Detalhado da Carteira</h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                Todos os movimentos financeiros registados na tua conta SkyBank
              </p>
            </div>

            {/* FILTROS E BUSCA */}
            <div style={styles.filterBar}>
              <input
                type="text"
                placeholder="Pesquisar por ref, nome ou tipo..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={styles.searchInput}
              />

              <div style={styles.filterPills}>
                <button
                  onClick={() => setTxTypeFilter('all')}
                  style={{
                    ...styles.filterPill,
                    ...(txTypeFilter === 'all' ? styles.filterPillActive : {}),
                  }}
                >
                  Todos
                </button>
                <button
                  onClick={() => setTxTypeFilter('in')}
                  style={{
                    ...styles.filterPill,
                    ...(txTypeFilter === 'in' ? styles.filterPillActive : {}),
                  }}
                >
                  Entradas
                </button>
                <button
                  onClick={() => setTxTypeFilter('out')}
                  style={{
                    ...styles.filterPill,
                    ...(txTypeFilter === 'out' ? styles.filterPillActive : {}),
                  }}
                >
                  Saídas
                </button>
                <button
                  onClick={() => setTxTypeFilter('payment')}
                  style={{
                    ...styles.filterPill,
                    ...(txTypeFilter === 'payment' ? styles.filterPillActive : {}),
                  }}
                >
                  Pagamentos
                </button>
              </div>
            </div>
          </div>

          {/* TABELA DE MOVIMENTOS */}
          <div style={{ overflowX: 'auto', marginTop: '16px' }}>
            <table style={styles.txTable}>
              <thead>
                <tr style={styles.txTableHeader}>
                  <th style={styles.th}>Tipo</th>
                  <th style={styles.th}>Descrição / Beneficiário</th>
                  <th style={styles.th}>Referência</th>
                  <th style={styles.th}>Data & Hora</th>
                  <th style={styles.th}>Estado</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Montante (Kz)</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={styles.emptyTd}>
                      Nenhum movimento encontrado para os critérios selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      style={styles.txTableRow}
                      onClick={() => setSelectedTx(tx)}
                    >
                      <td style={styles.td}>
                        <div
                          style={{
                            ...styles.txIconSquare,
                            color: tx.isPositive ? '#10b981' : '#0070f3',
                            backgroundColor: tx.isPositive
                              ? 'rgba(16,185,129,0.15)'
                              : 'rgba(0,112,243,0.15)',
                          }}
                        >
                          {tx.type === 'deposit'
                            ? '📥'
                            : tx.type === 'loan'
                            ? '👑'
                            : tx.type === 'payment'
                            ? '💳'
                            : tx.type === 'atm_code'
                            ? '🏧'
                            : '⇄'}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <strong style={{ fontSize: '13px', color: '#ffffff', display: 'block' }}>
                          {tx.title}
                        </strong>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{tx.sub}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.refCode}>{tx.ref || 'SKB-TX-REF'}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                          {tx.fullDate || tx.date}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.statusPill}>{tx.status || 'Concluído'}</span>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <strong
                          style={{
                            fontSize: '14px',
                            color: tx.isPositive ? '#10b981' : '#ef4444',
                          }}
                        >
                          {tx.isPositive ? '+' : '-'} {formatKz(tx.amount)} Kz
                        </strong>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTx(tx);
                          }}
                          style={styles.receiptSmallBtn}
                        >
                          Recibo
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= MODAL: REVELAR PIN DO CARTÃO ================= */}
        {cardPinModalOpen && (
          <div style={styles.modalBackdrop} onClick={() => setCardPinModalOpen(false)}>
            <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>Autenticação de Segurança</h3>
                <button onClick={() => setCardPinModalOpen(false)} style={styles.modalCloseBtn}>✕</button>
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '10px 0 16px 0' }}>
                Introduza o PIN de 4 dígitos da sua carteira SkyBank para visualizar os dados completos do cartão e o código CVV.
              </p>
              <form onSubmit={handleRevealCardDetails}>
                <input
                  type="password"
                  maxLength="4"
                  autoFocus
                  placeholder="••••"
                  value={cardPinInput}
                  onChange={(e) => setCardPinInput(e.target.value)}
                  style={styles.pinBigInput}
                />
                <button type="submit" style={{ ...styles.btnPrimary, width: '100%', marginTop: '16px' }}>
                  Confirmar e Ver Dados
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: DEPOSITAR FUNDOS ================= */}
        {depositModalOpen && (
          <div style={styles.modalBackdrop} onClick={() => setDepositModalOpen(false)}>
            <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>Depositar Fundos na Carteira</h3>
                <button onClick={() => setDepositModalOpen(false)} style={styles.modalCloseBtn}>✕</button>
              </div>

              <form onSubmit={handleDepositSubmit} style={{ marginTop: '14px' }}>
                <label style={styles.fieldLabel}>Método de Depósito</label>
                <div style={styles.methodGrid}>
                  {['Multicaixa Express', 'Transferência Bancária', 'Depósito em Balcão'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDepositMethod(m)}
                      style={{
                        ...styles.methodBox,
                        ...(depositMethod === m ? styles.methodBoxActive : {}),
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <label style={{ ...styles.fieldLabel, marginTop: '16px' }}>Montante a Carregar (Kz)</label>
                <input
                  type="number"
                  min="500"
                  step="500"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  style={styles.inputField}
                  required
                />

                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  {[10000, 25000, 50000, 100000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setDepositAmount(String(val))}
                      style={styles.quickChip}
                    >
                      +{val.toLocaleString('pt-AO')}
                    </button>
                  ))}
                </div>

                <div style={styles.infoSummaryBox}>
                  <div style={styles.infoRow}>
                    <span>Destino:</span>
                    <strong>Carteira SkyBank ({user.accountNumber})</strong>
                  </div>
                  <div style={styles.infoRow}>
                    <span>Taxa de processamento:</span>
                    <strong style={{ color: '#10b981' }}>0,00 Kz (Grátis)</strong>
                  </div>
                  <div style={styles.infoRow}>
                    <span>Disponibilidade:</span>
                    <strong>Imediata ⚡</strong>
                  </div>
                </div>

                <button type="submit" style={{ ...styles.btnPrimary, width: '100%', marginTop: '16px' }}>
                  Confirmar Depósito de {formatKz(depositAmount)} Kz
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: LEVANTAMENTO NO ATM MULTICAIXA ================= */}
        {atmModalOpen && (
          <div style={styles.modalBackdrop} onClick={() => setAtmModalOpen(false)}>
            <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>Levantamento Sem Cartão (Multicaixa ATM)</h3>
                <button onClick={() => setAtmModalOpen(false)} style={styles.modalCloseBtn}>✕</button>
              </div>

              {!atmResult ? (
                <form onSubmit={handleAtmWithdrawSubmit} style={{ marginTop: '14px' }}>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 14px 0' }}>
                    Gere um código seguro de 6 dígitos para levantar dinheiro em qualquer caixa automático Multicaixa sem usar o cartão físico.
                  </p>

                  <label style={styles.fieldLabel}>Montante a Levantar (Kz)</label>
                  <input
                    type="number"
                    min="1000"
                    max="100000"
                    step="1000"
                    value={atmAmount}
                    onChange={(e) => setAtmAmount(e.target.value)}
                    style={styles.inputField}
                    required
                  />

                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    {[5000, 10000, 20000, 50000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAtmAmount(String(val))}
                        style={styles.quickChip}
                      >
                        {val.toLocaleString('pt-AO')} Kz
                      </button>
                    ))}
                  </div>

                  <label style={{ ...styles.fieldLabel, marginTop: '16px' }}>PIN de Segurança da Carteira</label>
                  <input
                    type="password"
                    maxLength="4"
                    placeholder="••••"
                    value={atmPin}
                    onChange={(e) => setAtmPin(e.target.value)}
                    style={styles.inputField}
                    required
                  />

                  <button type="submit" style={{ ...styles.btnPrimary, width: '100%', marginTop: '18px' }}>
                    Gerar Código de Levantamento
                  </button>
                </form>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={styles.atmSuccessCircle}>✓</div>
                  <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold' }}>CÓDIGO GERADO COM SUCESSO</span>
                  <div style={styles.atmBigCode}>{atmResult.code}</div>
                  <p style={{ fontSize: '12px', color: '#cbd5e1', margin: '8px 0 16px 0' }}>
                    Dirija-se a qualquer ATM Multicaixa, selecione <strong>"Operações Sem Cartão"</strong> &gt; <strong>"Levantamentos"</strong> e introduza este código.
                  </p>
                  <div style={styles.infoSummaryBox}>
                    <div style={styles.infoRow}>
                      <span>Montante:</span>
                      <strong>{formatKz(atmResult.amount)} Kz</strong>
                    </div>
                    <div style={styles.infoRow}>
                      <span>Gerado às:</span>
                      <strong>{atmResult.createdAt}</strong>
                    </div>
                    <div style={styles.infoRow}>
                      <span>Válido até:</span>
                      <strong style={{ color: '#f59e0b' }}>{atmResult.expiresAt} (30 min)</strong>
                    </div>
                  </div>
                  <button
                    onClick={() => setAtmModalOpen(false)}
                    style={{ ...styles.btnPrimary, width: '100%', marginTop: '16px' }}
                  >
                    Concluir
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= MODAL: AJUSTAR LIMITE DO CARTÃO ================= */}
        {limitModalOpen && (
          <div style={styles.modalBackdrop} onClick={() => setLimitModalOpen(false)}>
            <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>Ajustar Limite Diário do Cartão</h3>
                <button onClick={() => setLimitModalOpen(false)} style={styles.modalCloseBtn}>✕</button>
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: '10px 0 16px 0' }}>
                Defina o teto máximo que pode ser debitado neste cartão por dia.
              </p>
              <input
                type="number"
                min="5000"
                max="2000000"
                step="5000"
                value={newLimitValue}
                onChange={(e) => setNewLimitValue(e.target.value)}
                style={styles.inputField}
              />
              <button
                onClick={() => {
                  updateCardLimit(currentCard.id, newLimitValue);
                  setLimitModalOpen(false);
                }}
                style={{ ...styles.btnPrimary, width: '100%', marginTop: '16px' }}
              >
                Guardar Novo Limite
              </button>
            </div>
          </div>
        )}

        {/* ================= MODAL: RECIBO DA TRANSAÇÃO ================= */}
        {selectedTx && (
          <div style={styles.modalBackdrop} onClick={() => setSelectedTx(null)}>
            <div style={styles.receiptBox} onClick={(e) => e.stopPropagation()}>
              <div style={{ textAlign: 'center', borderBottom: '1px dashed rgba(20, 120, 178, 0.3)', paddingBottom: '14px' }}>
                <img src={Logo} alt="SkyBank" style={{ width: '40px', borderRadius: '50%' }} />
                <h3 style={{ margin: '8px 0 2px 0', fontSize: '18px' }}>SKYBANK ANGOLA</h3>
                <p style={{ margin: 0, fontSize: '10px', color: '#64748b' }}>Comprovativo Oficial de Operação</p>
              </div>

              <div style={{ margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={styles.receiptRow}>
                  <span style={styles.receiptLabel}>Ref. Operação:</span>
                  <strong style={styles.receiptVal}>{selectedTx.ref || 'SKB-TX-REF'}</strong>
                </div>
                <div style={styles.receiptRow}>
                  <span style={styles.receiptLabel}>Tipo de Movimento:</span>
                  <span style={styles.receiptVal}>{selectedTx.title}</span>
                </div>
                <div style={styles.receiptRow}>
                  <span style={styles.receiptLabel}>Entidade / Destino:</span>
                  <span style={styles.receiptVal}>{selectedTx.recipient || selectedTx.sub}</span>
                </div>
                <div style={styles.receiptRow}>
                  <span style={styles.receiptLabel}>Data e Hora:</span>
                  <span style={styles.receiptVal}>{selectedTx.fullDate || selectedTx.date}</span>
                </div>
                {selectedTx.rechargeToken && (
                  <div style={{ ...styles.receiptRow, backgroundColor: '#06b6d415', padding: '6px', borderRadius: '6px' }}>
                    <span style={{ ...styles.receiptLabel, color: '#06b6d4' }}>Token Recarga:</span>
                    <strong style={{ ...styles.receiptVal, color: '#06b6d4', letterSpacing: '1px' }}>
                      {selectedTx.rechargeToken}
                    </strong>
                  </div>
                )}
                <div style={styles.receiptRow}>
                  <span style={styles.receiptLabel}>Estado da Operação:</span>
                  <span style={{ ...styles.receiptVal, color: '#10b981' }}>{selectedTx.status || 'Concluído'} ✓</span>
                </div>
                <div style={styles.receiptRow}>
                  <span style={styles.receiptLabel}>Taxa Aplicada:</span>
                  <span style={styles.receiptVal}>0,00 Kz (Isento)</span>
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
                    showToastNotification('Comprovativo enviado para impressão.');
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
      </div>
    </DashboardLayout>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  headerBanner: {
    backgroundColor: '#071022',
    border: '1px solid rgba(20, 120, 178, 0.25)',
    borderRadius: '12px',
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  badgeTop: {
    fontSize: '10px',
    fontWeight: 'bold',
    color: '#06b6d4',
    letterSpacing: '1px',
    display: 'block',
    marginBottom: '4px',
  },
  pageTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0 0 4px 0',
  },
  pageSubtitle: {
    fontSize: '12px',
    color: '#94a3b8',
    margin: 0,
  },
  bannerActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  btnPrimary: {
    backgroundColor: '#0070f3',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 18px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    justifyContent: 'center',
  },
  btnSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#cbd5e1',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '8px',
    padding: '10px 18px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    justifyContent: 'center',
  },
  btnGhost: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '18px',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  card: {
    backgroundColor: '#071022',
    border: '1px solid rgba(20, 120, 178, 0.2)',
    borderRadius: '12px',
    padding: '20px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardHeading: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#ffffff',
    margin: 0,
  },
  labelMuted: {
    fontSize: '11px',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  balanceBig: {
    fontSize: '30px',
    fontWeight: '800',
    color: '#ffffff',
    marginTop: '4px',
  },
  balanceSplitGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginTop: '16px',
  },
  balanceSubBox: {
    backgroundColor: '#0a152e',
    border: '1px solid rgba(20, 120, 178, 0.15)',
    borderRadius: '8px',
    padding: '12px',
  },
  subBoxLabel: {
    fontSize: '11px',
    color: '#94a3b8',
    display: 'block',
  },
  subBoxVal: {
    fontSize: '14px',
    color: '#ffffff',
    marginTop: '4px',
    display: 'block',
  },
  coordsCard: {
    backgroundColor: '#0a152e',
    border: '1px dashed rgba(20, 120, 178, 0.3)',
    borderRadius: '8px',
    padding: '12px 14px',
    marginTop: '16px',
  },
  coordsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coordLabel: {
    fontSize: '10px',
    color: '#64748b',
    display: 'block',
  },
  coordVal: {
    fontSize: '13px',
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  copyBtn: {
    backgroundColor: 'rgba(0, 112, 243, 0.15)',
    color: '#0070f3',
    border: '1px solid rgba(0, 112, 243, 0.3)',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: '11px',
    cursor: 'pointer',
  },
  tierTag: {
    fontSize: '11px',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    color: '#f59e0b',
    padding: '3px 8px',
    borderRadius: '12px',
    fontWeight: 'bold',
  },
  limitHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#cbd5e1',
    marginBottom: '6px',
  },
  progressBar: {
    height: '6px',
    backgroundColor: '#0d1d3a',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '6px',
    transition: 'width 0.3s ease',
  },
  /* CARTÕES */
  cardSelector: {
    display: 'flex',
    gap: '6px',
    backgroundColor: '#0a152e',
    padding: '4px',
    borderRadius: '8px',
  },
  cardSelectorTab: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#94a3b8',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  cardSelectorTabActive: {
    backgroundColor: '#0070f3',
    color: '#ffffff',
  },
  creditCardVisual: {
    height: '190px',
    borderRadius: '14px',
    padding: '18px 20px',
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    boxShadow: '0 12px 25px rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    position: 'relative',
    overflow: 'hidden',
  },
  cardTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBankLogo: {
    fontSize: '14px',
    fontWeight: '800',
    letterSpacing: '1.5px',
    color: '#ffffff',
  },
  cardTypeBadge: {
    fontSize: '9px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: '2px 6px',
    borderRadius: '4px',
    letterSpacing: '0.5px',
  },
  contactlessSymbol: {
    fontSize: '12px',
    color: '#06b6d4',
  },
  cardChip: {
    width: '36px',
    height: '26px',
    borderRadius: '5px',
    background: 'linear-gradient(135deg, #d4af37 0%, #f3e5ab 50%, #aa771c 100%)',
    border: '1px solid #996515',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '6px 0',
  },
  chipInner: {
    width: '28px',
    height: '18px',
    border: '1px solid rgba(0,0,0,0.2)',
    borderRadius: '3px',
  },
  cardNumberDisplay: {
    fontSize: '16px',
    fontFamily: 'monospace',
    letterSpacing: '2.5px',
    color: '#ffffff',
    textShadow: '0 1px 2px rgba(0,0,0,0.6)',
  },
  cardBottomRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardTinyLabel: {
    fontSize: '8px',
    color: '#cbd5e1',
    display: 'block',
    letterSpacing: '0.5px',
  },
  cardHolderName: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  cardExpiry: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  cardCvv: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  cardBlockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: '14px',
    letterSpacing: '1px',
  },
  cardActionsRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '16px',
  },
  cardControlBtn: {
    flex: 1,
    backgroundColor: '#0a152e',
    border: '1px solid rgba(20, 120, 178, 0.25)',
    borderRadius: '8px',
    padding: '8px 10px',
    color: '#cbd5e1',
    fontSize: '11px',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'center',
  },
  cardSettingsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    paddingTop: '16px',
  },
  cardSettingItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: '13px',
    color: '#ffffff',
    display: 'block',
  },
  settingDesc: {
    fontSize: '11px',
    color: '#64748b',
    margin: '2px 0 0 0',
  },
  limitCurrentTag: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#0070f3',
    backgroundColor: 'rgba(0, 112, 243, 0.12)',
    padding: '4px 8px',
    borderRadius: '6px',
  },
  toggleSwitch: {
    position: 'relative',
    display: 'inline-block',
    width: '36px',
    height: '20px',
  },
  toggleSlider: {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0070f3',
    borderRadius: '20px',
  },
  /* EXTRATO */
  statementHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '14px',
  },
  filterBar: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  searchInput: {
    backgroundColor: '#0a152e',
    border: '1px solid rgba(20, 120, 178, 0.25)',
    borderRadius: '8px',
    padding: '8px 12px',
    color: '#ffffff',
    fontSize: '12px',
    width: '220px',
  },
  filterPills: {
    display: 'flex',
    gap: '4px',
    backgroundColor: '#0a152e',
    padding: '3px',
    borderRadius: '8px',
  },
  filterPill: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    cursor: 'pointer',
  },
  filterPillActive: {
    backgroundColor: '#0070f3',
    color: '#ffffff',
  },
  txTable: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  txTableHeader: {
    borderBottom: '1px solid rgba(20, 120, 178, 0.2)',
  },
  th: {
    padding: '10px 12px',
    fontSize: '11px',
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
    verticalAlign: 'middle',
  },
  txTableRow: {
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  emptyTd: {
    padding: '24px',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '12px',
  },
  txIconSquare: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
  },
  refCode: {
    fontSize: '11px',
    fontFamily: 'monospace',
    color: '#94a3b8',
    backgroundColor: '#0a152e',
    padding: '3px 6px',
    borderRadius: '4px',
  },
  statusPill: {
    fontSize: '11px',
    color: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: '3px 8px',
    borderRadius: '10px',
    fontWeight: '500',
  },
  receiptSmallBtn: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(0, 112, 243, 0.3)',
    color: '#0070f3',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: '11px',
    cursor: 'pointer',
  },
  /* MODAIS */
  modalBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: '16px',
  },
  modalCard: {
    backgroundColor: '#071022',
    border: '1px solid rgba(20, 120, 178, 0.35)',
    borderRadius: '14px',
    padding: '22px',
    width: '100%',
    maxWidth: '460px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    paddingBottom: '12px',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: '18px',
    cursor: 'pointer',
  },
  fieldLabel: {
    fontSize: '12px',
    color: '#94a3b8',
    display: 'block',
    marginBottom: '6px',
  },
  inputField: {
    width: '100%',
    backgroundColor: '#0a152e',
    border: '1px solid rgba(20, 120, 178, 0.25)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#ffffff',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  pinBigInput: {
    width: '100%',
    backgroundColor: '#0a152e',
    border: '1px solid rgba(0, 112, 243, 0.4)',
    borderRadius: '8px',
    padding: '14px',
    color: '#ffffff',
    fontSize: '26px',
    letterSpacing: '12px',
    textAlign: 'center',
    boxSizing: 'border-box',
  },
  methodGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  },
  methodBox: {
    backgroundColor: '#0a152e',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    padding: '10px 6px',
    color: '#94a3b8',
    fontSize: '11px',
    cursor: 'pointer',
    textAlign: 'center',
  },
  methodBoxActive: {
    borderColor: '#0070f3',
    backgroundColor: 'rgba(0, 112, 243, 0.15)',
    color: '#ffffff',
    fontWeight: 'bold',
  },
  quickChip: {
    backgroundColor: '#0a152e',
    border: '1px solid rgba(20, 120, 178, 0.2)',
    borderRadius: '6px',
    padding: '5px 8px',
    color: '#cbd5e1',
    fontSize: '11px',
    cursor: 'pointer',
    flex: 1,
  },
  infoSummaryBox: {
    backgroundColor: '#0a152e',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '8px',
    padding: '12px',
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#cbd5e1',
  },
  atmSuccessCircle: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    color: '#10b981',
    fontSize: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 10px auto',
    fontWeight: 'bold',
  },
  atmBigCode: {
    fontSize: '36px',
    fontFamily: 'monospace',
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: '8px',
    margin: '12px 0',
    backgroundColor: '#0a152e',
    padding: '10px',
    borderRadius: '8px',
    border: '1px dashed #10b981',
  },
  receiptBox: {
    backgroundColor: '#071022',
    border: '1px solid rgba(20, 120, 178, 0.35)',
    borderRadius: '14px',
    padding: '24px',
    width: '100%',
    maxWidth: '440px',
  },
  receiptRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
  },
  receiptLabel: {
    color: '#94a3b8',
  },
  receiptVal: {
    color: '#ffffff',
    fontWeight: '500',
  },
};
