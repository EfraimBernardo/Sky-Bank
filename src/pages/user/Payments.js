import React, { useState } from 'react';
import Logo from '../../assets/ChatGPT Image 23_09_2026, 16_32_15.png';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useBank } from '../../contexts/BankContext';
import '../../styles/SkyBankShared.css';

export default function PaymentsScreen() {
  const {
    user,
    transactions,
    makePayment,
    showToastNotification,
  } = useBank();

  // Abas de navegação
  const [activeTab, setActiveTab] = useState('referencia'); // 'referencia' | 'servicos' | 'recargas' | 'historico'

  // Formulário Pagamento por Referência
  const [refEntity, setRefEntity] = useState('');
  const [refNumber, setRefNumber] = useState('');
  const [refAmount, setRefAmount] = useState('');
  const [refPin, setRefPin] = useState('');

  // Formulário de Serviços Populares
  const [selectedService, setSelectedService] = useState(null);
  const [serviceClientNum, setServiceClientNum] = useState('');
  const [serviceAmount, setServiceAmount] = useState('');
  const [servicePin, setServicePin] = useState('');

  // Formulário de Recarga Telefónica
  const [mobileOperator, setMobileOperator] = useState('Unitel');
  const [mobilePhone, setMobilePhone] = useState('923 456 789');
  const [mobileAmount, setMobileAmount] = useState('1000');
  const [mobilePin, setMobilePin] = useState('');

  // Modal de Comprovativo de Pagamento
  const [receiptTx, setReceiptTx] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const formatKz = (val) => {
    return Number(val || 0).toLocaleString('pt-AO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Lista de Serviços Populares em Angola
  const popularServices = [
    {
      id: 'ende',
      name: 'ENDE - Eletricidade',
      category: 'energy',
      entity: '00010',
      icon: '⚡',
      color: '#f59e0b',
      placeholder: 'Número do Contador (Ex: 0419283019)',
      desc: 'Recarga pré-paga com emissão imediata de código de 20 dígitos',
    },
    {
      id: 'epal',
      name: 'EPAL - Águas de Luanda',
      category: 'water',
      entity: '00020',
      icon: '💧',
      color: '#06b6d4',
      placeholder: 'Número do Cliente / Fatura',
      desc: 'Liquidação de faturas de consumo de água residencial e comercial',
    },
    {
      id: 'dstv',
      name: 'DSTV Multichoice',
      category: 'tv',
      entity: '00150',
      icon: '📺',
      color: '#0070f3',
      placeholder: 'Número do Cartão Smartcard / Cliente',
      desc: 'Renovação de pacotes Fácil, Grande, Grande+, Bué e Mega',
    },
    {
      id: 'zap',
      name: 'ZAP TV & Fibra',
      category: 'tv',
      entity: '00110',
      icon: '📡',
      color: '#ec4899',
      placeholder: 'Número do Cartão ZAP',
      desc: 'Carregamento de pacotes ZAP TV e internet Fibra',
    },
    {
      id: 'rupe',
      name: 'RUPE - Impostos AGT',
      category: 'state',
      entity: '00001',
      icon: '🏛️',
      color: '#10b981',
      placeholder: 'Número da RUPE (14 dígitos)',
      desc: 'Pagamento de impostos e Documento Único de Cobrança do Estado',
    },
    {
      id: 'tvcabo',
      name: 'TV Cabo Angola',
      category: 'internet',
      entity: '00180',
      icon: '🌐',
      color: '#8b5cf6',
      placeholder: 'Número de Contrato',
      desc: 'Pagamento de planos de internet fibra e televisão por cabo',
    },
  ];

  // Favoritos
  const favorites = [
    { name: 'ENDE Casa Talatona', entity: '00010', ref: '042918239', icon: '⚡' },
    { name: 'DSTV Sala', entity: '00150', ref: '102938472', icon: '📺' },
    { name: 'Internet TVCabo', entity: '00180', ref: '40192831', icon: '🌐' },
    { name: 'RUPE Licenciamento', entity: '00001', ref: '901238472', icon: '🏛️' },
  ];

  // SUBMIT: Pagamento por Referência
  const handleRefPaymentSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!refEntity || refEntity.length < 4) {
      setErrorMessage('Por favor, indique o código da Entidade (Ex: 00412).');
      return;
    }
    if (!refNumber || refNumber.length < 6) {
      setErrorMessage('Por favor, introduza a Referência de pagamento (9 dígitos).');
      return;
    }
    const amount = parseFloat(refAmount);
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage('Montante de pagamento inválido.');
      return;
    }
    if (amount > user.balance) {
      setErrorMessage(`Saldo insuficiente. Saldo disponível: ${formatKz(user.balance)} Kz.`);
      return;
    }
    if (!refPin || refPin !== user.pin) {
      setErrorMessage('PIN de segurança incorreto.');
      return;
    }

    const res = makePayment({
      serviceCategory: 'reference',
      serviceName: `Pagamento Ref. ${refEntity}`,
      entity: refEntity,
      reference: refNumber,
      amount,
      pin: refPin,
      description: `Pagamento Multicaixa Entidade: ${refEntity} Ref: ${refNumber}`,
    });

    if (res.success) {
      setReceiptTx(res.transaction);
      setRefEntity('');
      setRefNumber('');
      setRefAmount('');
      setRefPin('');
      setErrorMessage('');
    } else {
      setErrorMessage(res.message);
    }
  };

  // SUBMIT: Pagamento de Serviço Específico
  const handleServicePaymentSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedService) return;
    if (!serviceClientNum.trim()) {
      setErrorMessage(`Por favor, indique ${selectedService.placeholder}.`);
      return;
    }
    const amount = parseFloat(serviceAmount);
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage('Montante de pagamento inválido.');
      return;
    }
    if (amount > user.balance) {
      setErrorMessage(`Saldo insuficiente. Saldo disponível: ${formatKz(user.balance)} Kz.`);
      return;
    }
    if (!servicePin || servicePin !== user.pin) {
      setErrorMessage('PIN de segurança incorreto.');
      return;
    }

    const res = makePayment({
      serviceCategory: selectedService.category,
      serviceName: selectedService.name,
      entity: selectedService.entity,
      reference: serviceClientNum,
      amount,
      clientNumber: serviceClientNum,
      pin: servicePin,
      description: `${selectedService.name} - ${serviceClientNum}`,
    });

    if (res.success) {
      setReceiptTx(res.transaction);
      setSelectedService(null);
      setServiceClientNum('');
      setServiceAmount('');
      setServicePin('');
      setErrorMessage('');
    } else {
      setErrorMessage(res.message);
    }
  };

  // SUBMIT: Recarga Telefónica
  const handleMobileRechargeSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!mobilePhone.trim()) {
      setErrorMessage('Por favor, introduza o número de telemóvel.');
      return;
    }
    const amount = parseFloat(mobileAmount);
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage('Montante de recarga inválido.');
      return;
    }
    if (amount > user.balance) {
      setErrorMessage(`Saldo insuficiente. Saldo disponível: ${formatKz(user.balance)} Kz.`);
      return;
    }
    if (!mobilePin || mobilePin !== user.pin) {
      setErrorMessage('PIN de segurança incorreto.');
      return;
    }

    const res = makePayment({
      serviceCategory: 'telecom',
      serviceName: `Recarga ${mobileOperator}`,
      entity: mobileOperator === 'Unitel' ? '00412' : '00550',
      reference: mobilePhone.replace(/\s+/g, ''),
      amount,
      phoneNumber: mobilePhone,
      pin: mobilePin,
      description: `Recarga móvel direta ${mobileOperator} para ${mobilePhone}`,
    });

    if (res.success) {
      setReceiptTx(res.transaction);
      setMobilePin('');
      setErrorMessage('');
    } else {
      setErrorMessage(res.message);
    }
  };

  const paymentTransactions = transactions.filter(
    (tx) => tx.type === 'payment' || tx.category === 'Serviço' || tx.category === 'Pagamentos'
  );

  return (
    <DashboardLayout activeTab="Pagamentos">
      <div style={styles.container}>
        {/* BANNER DE BOAS-VINDAS */}
        <div style={styles.headerBanner}>
          <div>
            <span style={styles.badgeTop}>CENTRAL DE PAGAMENTOS EMIS / MULTICAIXA</span>
            <h1 style={styles.pageTitle}>Pagamentos & Serviços</h1>
            <p style={styles.pageSubtitle}>
              Paga faturas por referência, água, eletricidade ENDE, recargas de telemóvel e tributos de Angola com taxa 0 Kz.
            </p>
          </div>
          <div style={styles.bannerBalanceCard}>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Saldo em Carteira</span>
            <strong style={{ fontSize: '18px', color: '#ffffff', display: 'block' }}>
              {formatKz(user.balance)} <span style={{ color: '#0070f3' }}>Kz</span>
            </strong>
          </div>
        </div>

        {/* NAVEGAÇÃO DE ABAS */}
        <div style={styles.navTabs}>
          <button
            onClick={() => {
              setActiveTab('referencia');
              setErrorMessage('');
            }}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'referencia' ? styles.tabBtnActive : {}),
            }}
          >
            <span>📄</span> Pagamento por Referência
          </button>
          <button
            onClick={() => {
              setActiveTab('servicos');
              setErrorMessage('');
            }}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'servicos' ? styles.tabBtnActive : {}),
            }}
          >
            <span>⚡</span> Serviços (ENDE, EPAL, DSTV)
          </button>
          <button
            onClick={() => {
              setActiveTab('recargas');
              setErrorMessage('');
            }}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'recargas' ? styles.tabBtnActive : {}),
            }}
          >
            <span>📱</span> Recargas Móveis
          </button>
          <button
            onClick={() => {
              setActiveTab('historico');
              setErrorMessage('');
            }}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'historico' ? styles.tabBtnActive : {}),
            }}
          >
            <span>📜</span> Histórico & Comprovativos
          </button>
        </div>

        {errorMessage && (
          <div style={styles.errorAlert}>
            <span>⚠️ {errorMessage}</span>
          </div>
        )}

        {/* ================= ABA 1: PAGAMENTO POR REFERÊNCIA ================= */}
        {activeTab === 'referencia' && (
          <div style={styles.tabContentGrid}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.cardTitle}>Pagar com Entidade e Referência</h3>
                  <p style={styles.cardDesc}>
                    Suporte padrão a qualquer referência do sistema Multicaixa / EMIS em Angola.
                  </p>
                </div>
                <span style={styles.badgeFree}>TAXA 0 KZ</span>
              </div>

              <form onSubmit={handleRefPaymentSubmit} style={{ marginTop: '16px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Entidade (5 dígitos)</label>
                  <input
                    type="text"
                    maxLength="5"
                    placeholder="Ex: 00412"
                    value={refEntity}
                    onChange={(e) => setRefEntity(e.target.value)}
                    style={styles.inputField}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Referência (9 dígitos)</label>
                  <input
                    type="text"
                    maxLength="9"
                    placeholder="Ex: 928301948"
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                    style={styles.inputField}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Montante a Pagar (Kz)</label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    placeholder="Ex: 5000"
                    value={refAmount}
                    onChange={(e) => setRefAmount(e.target.value)}
                    style={styles.inputField}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>PIN de Segurança da Carteira</label>
                  <input
                    type="password"
                    maxLength="4"
                    placeholder="••••"
                    value={refPin}
                    onChange={(e) => setRefPin(e.target.value)}
                    style={styles.inputField}
                    required
                  />
                </div>

                <button type="submit" style={{ ...styles.btnPrimary, width: '100%', marginTop: '10px' }}>
                  Confirmar e Efetuar Pagamento
                </button>
              </form>
            </div>

            {/* FAVORITOS & GUIA RÁPIDO */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={styles.card}>
                <h3 style={{ ...styles.cardTitle, fontSize: '14px', marginBottom: '12px' }}>
                  ⭐ Favoritos Frequentes
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {favorites.map((fav, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setRefEntity(fav.entity);
                        setRefNumber(fav.ref);
                        showToastNotification(`Dados de ${fav.name} carregados.`);
                      }}
                      style={styles.favItem}
                    >
                      <div style={styles.favIconCircle}>{fav.icon}</div>
                      <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: '12px', color: '#ffffff' }}>{fav.name}</strong>
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>
                          Ent: {fav.entity} • Ref: {fav.ref}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#0070f3' }}>Usar ›</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.card}>
                <h3 style={{ ...styles.cardTitle, fontSize: '14px', marginBottom: '8px' }}>
                  ℹ️ Dicas de Segurança
                </h3>
                <ul style={styles.tipsList}>
                  <li>Confirma sempre o código de Entidade antes de autorizar.</li>
                  <li>O recibo oficial fica guardado e disponível para consulta a qualquer momento.</li>
                  <li>Em caso de engano na referência, o estorno depende da validação com a entidade credora.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ================= ABA 2: SERVIÇOS POPULARES ================= */}
        {activeTab === 'servicos' && (
          <div>
            {!selectedService ? (
              <div style={styles.servicesGrid}>
                {popularServices.map((srv) => (
                  <div
                    key={srv.id}
                    onClick={() => {
                      setSelectedService(srv);
                      setErrorMessage('');
                    }}
                    style={styles.serviceCard}
                  >
                    <div style={{ ...styles.serviceIconBadge, backgroundColor: `${srv.color}20`, color: srv.color }}>
                      {srv.icon}
                    </div>
                    <strong style={styles.serviceName}>{srv.name}</strong>
                    <span style={styles.serviceEntityTag}>Entidade: {srv.entity}</span>
                    <p style={styles.serviceDesc}>{srv.desc}</p>
                    <button style={styles.serviceActionBtn}>Pagar Agora →</button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        ...styles.serviceIconBadge,
                        backgroundColor: `${selectedService.color}20`,
                        color: selectedService.color,
                      }}
                    >
                      {selectedService.icon}
                    </div>
                    <div>
                      <h3 style={{ ...styles.cardTitle, margin: 0 }}>{selectedService.name}</h3>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        Entidade Oficial: {selectedService.entity}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedService(null)}
                    style={styles.btnSecondary}
                  >
                    ← Voltar aos Serviços
                  </button>
                </div>

                <form onSubmit={handleServicePaymentSubmit} style={{ marginTop: '20px', maxWidth: '520px' }}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>{selectedService.placeholder}</label>
                    <input
                      type="text"
                      placeholder="Introduza o identificador..."
                      value={serviceClientNum}
                      onChange={(e) => setServiceClientNum(e.target.value)}
                      style={styles.inputField}
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Montante (Kz)</label>
                    <input
                      type="number"
                      min="500"
                      step="500"
                      placeholder="Ex: 5000"
                      value={serviceAmount}
                      onChange={(e) => setServiceAmount(e.target.value)}
                      style={styles.inputField}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                    {[2000, 5000, 10000, 20000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setServiceAmount(String(val))}
                        style={styles.quickChip}
                      >
                        {val.toLocaleString('pt-AO')} Kz
                      </button>
                    ))}
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>PIN de Segurança da Carteira</label>
                    <input
                      type="password"
                      maxLength="4"
                      placeholder="••••"
                      value={servicePin}
                      onChange={(e) => setServicePin(e.target.value)}
                      style={styles.inputField}
                      required
                    />
                  </div>

                  <button type="submit" style={{ ...styles.btnPrimary, width: '100%', marginTop: '10px' }}>
                    Concluir Pagamento de {serviceAmount ? formatKz(serviceAmount) : '0,00'} Kz
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ================= ABA 3: RECARGAS MÓVEIS ================= */}
        {activeTab === 'recargas' && (
          <div style={styles.tabContentGrid}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Recarga Telefónica Imediata</h3>
              <p style={styles.cardDesc}>
                Carregue o seu saldo de voz ou dados de internet diretamente para qualquer operadora de Angola.
              </p>

              <form onSubmit={handleMobileRechargeSubmit} style={{ marginTop: '16px' }}>
                <label style={styles.label}>Escolhe a Operadora</label>
                <div style={styles.operatorGrid}>
                  {['Unitel', 'Africell', 'Movicel'].map((op) => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => setMobileOperator(op)}
                      style={{
                        ...styles.operatorBtn,
                        ...(mobileOperator === op ? styles.operatorBtnActive : {}),
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>📶</span>
                      <strong>{op}</strong>
                    </button>
                  ))}
                </div>

                <div style={{ ...styles.formGroup, marginTop: '14px' }}>
                  <label style={styles.label}>Número de Telemóvel (+244)</label>
                  <input
                    type="tel"
                    placeholder="Ex: 923 456 789"
                    value={mobilePhone}
                    onChange={(e) => setMobilePhone(e.target.value)}
                    style={styles.inputField}
                    required
                  />
                </div>

                <label style={styles.label}>Montante da Recarga</label>
                <div style={styles.amountGrid}>
                  {['500', '1000', '2000', '5000', '10000'].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setMobileAmount(val)}
                      style={{
                        ...styles.amountChip,
                        ...(mobileAmount === val ? styles.amountChipActive : {}),
                      }}
                    >
                      {Number(val).toLocaleString('pt-AO')} Kz
                    </button>
                  ))}
                </div>

                <div style={{ ...styles.formGroup, marginTop: '16px' }}>
                  <label style={styles.label}>PIN de Segurança</label>
                  <input
                    type="password"
                    maxLength="4"
                    placeholder="••••"
                    value={mobilePin}
                    onChange={(e) => setMobilePin(e.target.value)}
                    style={styles.inputField}
                    required
                  />
                </div>

                <button type="submit" style={{ ...styles.btnPrimary, width: '100%', marginTop: '10px' }}>
                  Carregar {mobileAmount} Kz para {mobilePhone}
                </button>
              </form>
            </div>

            {/* INFORMAÇÃO OPERADORA */}
            <div style={styles.card}>
              <h3 style={{ ...styles.cardTitle, fontSize: '14px', marginBottom: '10px' }}>
                Benefícios da Recarga SkyBank
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={styles.benefitItem}>
                  <span style={{ fontSize: '18px' }}>⚡</span>
                  <div>
                    <strong style={{ fontSize: '12px', color: '#ffffff' }}>Ativação Imediata</strong>
                    <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>O saldo é creditado em menos de 10 segundos na tua linha móvel.</p>
                  </div>
                </div>
                <div style={styles.benefitItem}>
                  <span style={{ fontSize: '18px' }}>🎉</span>
                  <div>
                    <strong style={{ fontSize: '12px', color: '#ffffff' }}>Bónus de Operadora Mantidos</strong>
                    <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Manténs direito a todos os bónus de recarga oferecidos pela operadora.</p>
                  </div>
                </div>
                <div style={styles.benefitItem}>
                  <span style={{ fontSize: '18px' }}>🛡️</span>
                  <div>
                    <strong style={{ fontSize: '12px', color: '#ffffff' }}>Taxa Zero de Serviço</strong>
                    <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Não cobramos nenhuma taxa adicional sobre a recarga.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= ABA 4: HISTÓRICO & COMPROVATIVOS ================= */}
        {activeTab === 'historico' && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Histórico de Pagamentos de Serviços</h3>
            <p style={styles.cardDesc}>Consulta e imprime os comprovativos de todas as tuas faturas liquidadas.</p>

            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {paymentTransactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b', fontSize: '13px' }}>
                  Ainda não realizaste pagamentos de serviços.
                </div>
              ) : (
                paymentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => setReceiptTx(tx)}
                    style={styles.paymentRow}
                  >
                    <div style={styles.paymentRowIcon}>💳</div>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: '13px', color: '#ffffff', display: 'block' }}>
                        {tx.title}
                      </strong>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {tx.sub} • {tx.fullDate || tx.date}
                      </span>
                      {tx.rechargeToken && (
                        <span style={styles.tokenBadge}>Token: {tx.rechargeToken}</span>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ fontSize: '14px', color: '#ef4444', display: 'block' }}>
                        - {formatKz(tx.amount)} Kz
                      </strong>
                      <span style={{ fontSize: '11px', color: '#0070f3' }}>Ver Comprovativo →</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ================= MODAL: COMPROVATIVO OFICIAL ================= */}
        {receiptTx && (
          <div style={styles.modalBackdrop} onClick={() => setReceiptTx(null)}>
            <div style={styles.receiptBox} onClick={(e) => e.stopPropagation()}>
              <div style={{ textAlign: 'center', borderBottom: '1px dashed rgba(20, 120, 178, 0.3)', paddingBottom: '14px' }}>
                <img src={Logo} alt="SkyBank" style={{ width: '42px', borderRadius: '50%' }} />
                <h3 style={{ margin: '8px 0 2px 0', fontSize: '18px' }}>SKYBANK ANGOLA</h3>
                <p style={{ margin: 0, fontSize: '10px', color: '#64748b' }}>Comprovativo Oficial de Pagamento EMIS</p>
              </div>

              <div style={{ margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={styles.receiptRow}>
                  <span style={styles.receiptLabel}>Ref. Operação:</span>
                  <strong style={styles.receiptVal}>{receiptTx.ref || 'SKB-PAG-0000'}</strong>
                </div>
                <div style={styles.receiptRow}>
                  <span style={styles.receiptLabel}>Serviço / Beneficiário:</span>
                  <span style={styles.receiptVal}>{receiptTx.recipient || receiptTx.title}</span>
                </div>
                <div style={styles.receiptRow}>
                  <span style={styles.receiptLabel}>Identificador / Ref:</span>
                  <span style={styles.receiptVal}>{receiptTx.sub}</span>
                </div>
                <div style={styles.receiptRow}>
                  <span style={styles.receiptLabel}>Data e Hora:</span>
                  <span style={styles.receiptVal}>{receiptTx.fullDate || receiptTx.date}</span>
                </div>

                {receiptTx.rechargeToken && (
                  <div style={{ backgroundColor: '#06b6d418', padding: '10px', borderRadius: '8px', textAlign: 'center', marginTop: '6px' }}>
                    <span style={{ fontSize: '10px', color: '#06b6d4', display: 'block', fontWeight: 'bold' }}>
                      CÓDIGO DE RECARGA (DIGITE NO SEU CONTADOR)
                    </span>
                    <strong style={{ fontSize: '16px', color: '#06b6d4', letterSpacing: '2px', fontFamily: 'monospace' }}>
                      {receiptTx.rechargeToken}
                    </strong>
                  </div>
                )}

                <div style={styles.receiptRow}>
                  <span style={styles.receiptLabel}>Estado da Operação:</span>
                  <span style={{ ...styles.receiptVal, color: '#10b981' }}>{receiptTx.status || 'Concluído'} ✓</span>
                </div>
                <div style={styles.receiptRow}>
                  <span style={styles.receiptLabel}>Taxa de Serviço:</span>
                  <span style={styles.receiptVal}>0,00 Kz (Isento)</span>
                </div>

                <div style={{ ...styles.receiptRow, marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px' }}>
                  <span style={{ fontSize: '14px', color: '#ffffff', fontWeight: 'bold' }}>Montante Liquidado:</span>
                  <span style={{ fontSize: '18px', color: '#0070f3', fontWeight: 'bold' }}>
                    {formatKz(receiptTx.amount)} Kz
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  onClick={() => {
                    showToastNotification('Comprovativo enviado para impressão.');
                    setReceiptTx(null);
                  }}
                  style={styles.btnPrimary}
                >
                  Imprimir / Descarregar
                </button>
                <button
                  onClick={() => setReceiptTx(null)}
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
  bannerBalanceCard: {
    backgroundColor: '#0a152e',
    border: '1px solid rgba(20, 120, 178, 0.2)',
    padding: '12px 18px',
    borderRadius: '10px',
    textAlign: 'right',
  },
  navTabs: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    borderBottom: '1px solid rgba(20, 120, 178, 0.2)',
    paddingBottom: '8px',
  },
  tabBtn: {
    backgroundColor: '#071022',
    border: '1px solid rgba(20, 120, 178, 0.2)',
    borderRadius: '8px',
    padding: '10px 16px',
    color: '#94a3b8',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  tabBtnActive: {
    backgroundColor: '#0070f3',
    borderColor: '#0070f3',
    color: '#ffffff',
    fontWeight: '600',
  },
  errorAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#ef4444',
    fontSize: '13px',
  },
  tabContentGrid: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr',
    gap: '18px',
  },
  card: {
    backgroundColor: '#071022',
    border: '1px solid rgba(20, 120, 178, 0.2)',
    borderRadius: '12px',
    padding: '22px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    margin: '0 0 4px 0',
  },
  cardDesc: {
    fontSize: '12px',
    color: '#94a3b8',
    margin: 0,
  },
  badgeFree: {
    fontSize: '10px',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#10b981',
    fontWeight: 'bold',
    padding: '3px 8px',
    borderRadius: '8px',
  },
  formGroup: {
    marginBottom: '14px',
  },
  label: {
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
  btnPrimary: {
    backgroundColor: '#0070f3',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 18px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'center',
    flex: 1,
  },
  btnSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#cbd5e1',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '8px',
    padding: '8px 14px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  favItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#0a152e',
    border: '1px solid rgba(20, 120, 178, 0.15)',
    borderRadius: '8px',
    padding: '10px 12px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  favIconCircle: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 112, 243, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
  },
  tipsList: {
    paddingLeft: '18px',
    margin: 0,
    fontSize: '12px',
    color: '#94a3b8',
    lineHeight: '1.6',
  },
  /* SERVIÇOS */
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '16px',
  },
  serviceCard: {
    backgroundColor: '#071022',
    border: '1px solid rgba(20, 120, 178, 0.2)',
    borderRadius: '12px',
    padding: '18px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    transition: 'transform 0.2s, border-color 0.2s',
  },
  serviceIconBadge: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  serviceName: {
    fontSize: '14px',
    color: '#ffffff',
  },
  serviceEntityTag: {
    fontSize: '10px',
    color: '#06b6d4',
    fontFamily: 'monospace',
  },
  serviceDesc: {
    fontSize: '11px',
    color: '#94a3b8',
    margin: 0,
    flex: 1,
    lineHeight: '1.4',
  },
  serviceActionBtn: {
    marginTop: '8px',
    backgroundColor: 'rgba(0, 112, 243, 0.12)',
    color: '#0070f3',
    border: '1px solid rgba(0, 112, 243, 0.25)',
    borderRadius: '6px',
    padding: '6px 10px',
    fontSize: '11px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  quickChip: {
    backgroundColor: '#0a152e',
    border: '1px solid rgba(20, 120, 178, 0.2)',
    borderRadius: '6px',
    padding: '6px 8px',
    color: '#cbd5e1',
    fontSize: '11px',
    cursor: 'pointer',
    flex: 1,
  },
  /* RECARGAS */
  operatorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
  },
  operatorBtn: {
    backgroundColor: '#0a152e',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    padding: '12px',
    color: '#94a3b8',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  },
  operatorBtnActive: {
    borderColor: '#0070f3',
    backgroundColor: 'rgba(0, 112, 243, 0.15)',
    color: '#ffffff',
  },
  amountGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: '8px',
  },
  amountChip: {
    backgroundColor: '#0a152e',
    border: '1px solid rgba(20, 120, 178, 0.2)',
    borderRadius: '6px',
    padding: '8px 4px',
    color: '#cbd5e1',
    fontSize: '11px',
    cursor: 'pointer',
    textAlign: 'center',
  },
  amountChipActive: {
    backgroundColor: '#0070f3',
    borderColor: '#0070f3',
    color: '#ffffff',
    fontWeight: 'bold',
  },
  benefitItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  /* HISTÓRICO */
  paymentRow: {
    backgroundColor: '#0a152e',
    border: '1px solid rgba(20, 120, 178, 0.15)',
    borderRadius: '8px',
    padding: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
  },
  paymentRowIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    color: '#06b6d4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
  },
  tokenBadge: {
    display: 'inline-block',
    marginTop: '4px',
    fontSize: '10px',
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    color: '#06b6d4',
    padding: '2px 6px',
    borderRadius: '4px',
    fontFamily: 'monospace',
  },
  /* MODAL */
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
