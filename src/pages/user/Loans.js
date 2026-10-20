import React, { useState } from 'react';
import Logo from '../../assets/ChatGPT Image 23_09_2026, 16_32_15.png';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useBank } from '../../contexts/BankContext';
import '../../styles/SkyBankShared.css';

export default function LoansScreen() {
  const {
    user,
    loans,
    applyForLoan,
    payLoanInstallment,
    toggleAutoDebit,
    showToastNotification,
  } = useBank();

  // Estados do Simulador de Empréstimo
  const [loanAmount, setLoanAmount] = useState(50000);
  const [termMonths, setTermMonths] = useState(6);
  const [purpose, setPurpose] = useState('Pessoal');
  const [securityPin, setSecurityPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [approvalModal, setApprovalModal] = useState(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [repayConfirmModal, setRepayConfirmModal] = useState(null);

  const activeLoan = loans[0];

  const formatKz = (val) => {
    return Number(val).toLocaleString('pt-AO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Cálculo financeiro do simulador oficial (Requisitos v1.0)
  const interestRate = 10.0; // Juros oficiais: 10%
  const openingFee = 2500; // Taxa automática: 2.500 Kz
  const latePenalty = 5.0; // Penalização por atraso: 5%
  const totalInterest = loanAmount * (interestRate / 100);
  const totalRepayment = loanAmount + totalInterest;
  const estimatedMonthly = Math.round(totalRepayment / termMonths);
  const netDisbursement = Math.max(0, loanAmount - openingFee);

  const handleApply = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (user.status === 'Suspensa') {
      setErrorMessage('A sua conta está Suspensa. Durante o período de suspensão não é permitido solicitar empréstimos.');
      return;
    }

    if (user.tier === 'Mini') {
      setErrorMessage('A conta de nível Mini (12–14 anos) não tem autorização para solicitar empréstimos de acordo com os requisitos do SkyBank.');
      return;
    }

    if (loanAmount <= 0) {
      setErrorMessage('O montante do empréstimo deve ser superior a zero.');
      return;
    }

    if (loanAmount > user.creditLimit) {
      setErrorMessage(`O valor solicitado excede o limite disponível para o seu nível (${formatKz(user.creditLimit)} Kz).`);
      return;
    }

    if (!securityPin || securityPin.length !== 4) {
      setErrorMessage('Por favor, digite o PIN de 4 números para autenticar o pedido.');
      return;
    }

    const res = applyForLoan({
      amount: loanAmount,
      termMonths,
      purpose,
      pin: securityPin,
    });

    if (res.success) {
      setApprovalModal(res.loan);
      setSecurityPin('');
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleRepay = (loan) => {
    if (user.balance < loan.monthlyPayment) {
      showToastNotification('Saldo insuficiente para pagar esta parcela.');
      return;
    }
    const res = payLoanInstallment(loan.id, loan.monthlyPayment);
    if (res.success) {
      setRepayConfirmModal(null);
    }
  };

  // Cronograma simulado de prestações
  const installmentsSchedule = [
    { number: 1, date: '10/05/2025', amount: 12500, status: 'Liquidada', paid: true },
    { number: 2, date: '10/06/2025', amount: 12500, status: 'Liquidada', paid: true },
    { number: 3, date: '10/07/2025', amount: 12500, status: 'Agendada (Auto)', current: true },
    { number: 4, date: '10/08/2025', amount: 12500, status: 'Futura' },
    { number: 5, date: '10/09/2025', amount: 12500, status: 'Futura' },
    { number: 6, date: '10/10/2025', amount: 12500, status: 'Futura' },
  ];

  return (
    <DashboardLayout activeTab="Empréstimos">
      {/* CABEÇALHO */}
      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.pageTitle}>Empréstimos & Linhas de Crédito</h2>
          <p style={styles.pageSubtitle}>
            Aceda a crédito imediato com base no seu nível de conta, taxas competitivas e gestão de pagamentos automáticos.
          </p>
        </div>
      </div>

      {/* BANNER DE NÍVEL DE CONTA E LIMITE DISPONÍVEL */}
      <div style={styles.tierBanner}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={styles.tierIconBadge}>{user.tierIcon || '👑'}</div>
          <div>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>O teu Nível de Conta</span>
            <h3 style={{ margin: '2px 0 0 0', fontSize: '18px', color: '#ffffff' }}>
              Nível {user.tier} {user.tierIcon}
            </h3>
            <span style={{ fontSize: '11px', color: '#10b981' }}>
              Limite pré-aprovado: até {formatKz(user.creditLimit)} Kz
            </span>
          </div>
        </div>

        <div style={styles.tierComparison}>
          <div style={styles.tierMiniItem}>
            <span style={{ fontSize: '10px', color: '#06b6d4', fontWeight: 'bold' }}>MINI (12-14a)</span>
            <span style={{ fontSize: '11px', color: '#cbd5e1' }}>Não autorizado</span>
          </div>
          <div style={styles.tierMiniItem}>
            <span style={{ fontSize: '10px', color: '#0070f3', fontWeight: 'bold' }}>BÁSICA (15+a)</span>
            <span style={{ fontSize: '11px', color: '#cbd5e1' }}>50k a 150k Kz</span>
          </div>
          <div style={styles.tierMiniItem}>
            <span style={{ fontSize: '10px', color: '#cbd5e1' }}>INTERMÉDIA</span>
            <span style={{ fontSize: '11px', color: '#cbd5e1' }}>200k a 500k Kz</span>
          </div>
          <div style={styles.tierMiniItem}>
            <span style={{ fontSize: '10px', color: '#f59e0b' }}>COMPLETA</span>
            <span style={{ fontSize: '11px', color: '#cbd5e1' }}>600k a 1M Kz</span>
          </div>
        </div>
      </div>

      {/* ALERTA DE ELEGIBILIDADE PARA NÍVEL MINI */}
      {user.tier === 'Mini' && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '10px', padding: '14px 18px', color: '#ef4444', fontSize: '13px', lineHeight: '1.5' }}>
          🚫 <strong>Restrição de Nível Mini:</strong> A conta Mini (faixa etária dos 12 aos 14 anos) é uma conta protegida e não tem permissão para solicitar empréstimos de acordo com os requisitos e regras de negócio do SkyBank. Os empréstimos estarão disponíveis quando completar 15 anos e transitar para a conta Básica.
        </div>
      )}

      {/* GRID PRINCIPAL: EMPRÉSTIMO ATIVO + SIMULADOR */}
      <div style={styles.mainGrid} className="sky-loans-grid">
        
        {/* COLUNA ESQUERDA: GESTÃO DO EMPRÉSTIMO ATIVO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={styles.card}>
            <div style={styles.cardHeaderRow}>
              <div>
                <h3 style={styles.cardTitle}>Empréstimo Ativo</h3>
                <span style={styles.cardSubtitle}>
                  {activeLoan ? `${activeLoan.title} (${activeLoan.code})` : 'Sem empréstimos ativos'}
                </span>
              </div>
              {activeLoan && (
                <span style={styles.statusBadgeActive}>{activeLoan.status}</span>
              )}
            </div>

            {activeLoan ? (
              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Saldo Devedor Restante</span>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff' }}>
                      {formatKz(activeLoan.remainingAmount)} <span style={{ color: '#0070f3', fontSize: '18px' }}>Kz</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Total Contratado</span>
                    <div style={{ fontSize: '14px', color: '#cbd5e1' }}>
                      {formatKz(activeLoan.totalAmount)} Kz
                    </div>
                  </div>
                </div>

                {/* BARRA DE PROGRESSO */}
                <div style={styles.progressBarTrack}>
                  <div
                    style={{
                      ...styles.progressBarFill,
                      width: `${activeLoan.percentage}%`,
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                  <span>Amortizado: {formatKz(activeLoan.paidAmount)} Kz</span>
                  <span style={{ color: '#0070f3', fontWeight: 'bold' }}>{activeLoan.percentage}% liquidado</span>
                </div>

                {/* DETALHES DO CONTRATO */}
                <div style={styles.loanDetailsGrid}>
                  <div style={styles.loanDetailItem}>
                    <span style={styles.loanDetailLabel}>Prestação Mensal:</span>
                    <strong style={styles.loanDetailVal}>{formatKz(activeLoan.monthlyPayment)} Kz</strong>
                  </div>
                  <div style={styles.loanDetailItem}>
                    <span style={styles.loanDetailLabel}>Próximo Débito:</span>
                    <strong style={{ ...styles.loanDetailVal, color: '#f59e0b' }}>{activeLoan.nextDueDate}</strong>
                  </div>
                  <div style={styles.loanDetailItem}>
                    <span style={styles.loanDetailLabel}>Prazo Restante:</span>
                    <strong style={styles.loanDetailVal}>
                      {activeLoan.termMonths - activeLoan.paidMonths} de {activeLoan.termMonths} meses
                    </strong>
                  </div>
                  <div style={styles.loanDetailItem}>
                    <span style={styles.loanDetailLabel}>Taxa Aplicada:</span>
                    <strong style={styles.loanDetailVal}>{activeLoan.interestRate}% ao ano</strong>
                  </div>
                </div>

                {/* TOGGLE: PAGAMENTO AUTOMÁTICO */}
                <div style={styles.autoDebitCard}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px' }}>📅</span>
                      <strong style={{ fontSize: '13px', color: '#ffffff' }}>Pagamento Automático</strong>
                    </div>
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0 0' }}>
                      Débito direto mensal garantido para manter o teu histórico impecável.
                    </p>
                  </div>
                  <label style={styles.switch}>
                    <input
                      type="checkbox"
                      checked={activeLoan.autoDebit}
                      onChange={() => toggleAutoDebit(activeLoan.id)}
                    />
                    <span style={styles.slider}></span>
                  </label>
                </div>

                {/* BOTÕES DE AÇÃO */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                  <button
                    type="button"
                    style={styles.btnPrimary}
                    onClick={() => setRepayConfirmModal(activeLoan)}
                  >
                    Amortizar Parcela ({formatKz(activeLoan.monthlyPayment)} Kz)
                  </button>
                  <button
                    type="button"
                    style={styles.btnSecondary}
                    onClick={() => setScheduleModalOpen(true)}
                  >
                    Ver Cronograma
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
                <span style={{ fontSize: '32px' }}>🎉</span>
                <h4 style={{ margin: '10px 0 4px 0', color: '#ffffff' }}>Nenhum empréstimo ativo</h4>
                <p style={{ fontSize: '12px', margin: 0 }}>
                  Aproveite a sua linha de crédito aprovada para financiar os seus planos!
                </p>
              </div>
            )}
          </div>

          {/* DICAS DE EDUCAÇÃO FINANCEIRA SKYBANK */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Vantagens do Crédito SkyBank</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ color: '#10b981', fontSize: '16px' }}>✓</span>
                <div>
                  <strong style={{ fontSize: '12px', color: '#ffffff' }}>Crédito Imediato na Carteira</strong>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                    Após validação por PIN, o valor fica imediatamente disponível para transferências e pagamentos.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ color: '#10b981', fontSize: '16px' }}>✓</span>
                <div>
                  <strong style={{ fontSize: '12px', color: '#ffffff' }}>Amortização Antecipada Sem Penalizações</strong>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                    Pague parcelas adiantadas a qualquer momento para reduzir o saldo devedor.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* COLUNA DIREITA: SIMULADOR E NOVA SOLICITAÇÃO */}
        <div style={styles.card}>
          <div style={styles.cardHeaderRow}>
            <div>
              <h3 style={styles.cardTitle}>Simulador de Empréstimo</h3>
              <span style={styles.cardSubtitle}>Calcule as suas prestações e submeta o pedido online</span>
            </div>
            <span style={{ fontSize: '18px' }}>🧮</span>
          </div>

          {errorMessage && (
            <div style={styles.errorAlert}>
              <span>⚠️</span>
              <span style={{ fontSize: '12px', color: '#ef4444' }}>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleApply} style={styles.form}>
            {/* VALOR DESEJADO */}
            <div style={styles.inputGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={styles.label}>Valor Pretendido (Kz)</label>
                <span style={{ fontSize: '13px', color: '#0070f3', fontWeight: 'bold' }}>
                  {formatKz(loanAmount)} Kz
                </span>
              </div>
              <input
                type="range"
                min="20000"
                max={user.creditLimit}
                step="5000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                style={styles.sliderInput}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b' }}>
                <span>Mín: 20.000 Kz</span>
                <span>Máx: {formatKz(user.creditLimit)} Kz</span>
              </div>
            </div>

            {/* PRAZO DE PAGAMENTO */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Prazo de Reembolso</label>
              <div style={styles.termButtonsRow}>
                {[3, 6, 12, 24].map((m) => (
                  <button
                    key={m}
                    type="button"
                    style={{
                      ...styles.termBtn,
                      ...(termMonths === m ? styles.termBtnActive : {}),
                    }}
                    onClick={() => setTermMonths(m)}
                  >
                    {m} Meses
                  </button>
                ))}
              </div>
            </div>

            {/* FINALIDADE */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Finalidade do Empréstimo</label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                style={styles.selectInput}
              >
                <option value="Pessoal">Despesas Pessoais</option>
                <option value="Equipamento">Aquisição de Equipamento</option>
                <option value="Negócio">Investimento em Negócio</option>
                <option value="Educação">Educação / Formação</option>
                <option value="Emergência">Saúde / Emergência</option>
              </select>
            </div>

            {/* RESUMO DO CÁLCULO FINANCEIRO (Requisitos v1.0) */}
            <div style={styles.calcSummaryBox}>
              <div style={styles.calcRow}>
                <span style={styles.calcLabel}>Prestação Mensal Estimada:</span>
                <strong style={{ fontSize: '16px', color: '#10b981' }}>
                  {formatKz(estimatedMonthly)} Kz/mês
                </strong>
              </div>
              <div style={styles.calcRow}>
                <span style={styles.calcLabel}>Taxa de Juro Oficial:</span>
                <span style={styles.calcVal}>{interestRate}%</span>
              </div>
              <div style={styles.calcRow}>
                <span style={styles.calcLabel}>Taxa Automática de Abertura:</span>
                <span style={{ ...styles.calcVal, color: '#f59e0b' }}>{formatKz(openingFee)} Kz</span>
              </div>
              <div style={styles.calcRow}>
                <span style={styles.calcLabel}>Valor Líquido a Desembolsar:</span>
                <strong style={{ ...styles.calcVal, color: '#06b6d4' }}>{formatKz(netDisbursement)} Kz</strong>
              </div>
              <div style={styles.calcRow}>
                <span style={styles.calcLabel}>Penalização por Atraso:</span>
                <span style={styles.calcVal}>{latePenalty}%</span>
              </div>
              <div style={styles.calcRow}>
                <span style={styles.calcLabel}>Total de Juros Estimados:</span>
                <span style={styles.calcVal}>{formatKz(totalInterest)} Kz</span>
              </div>
              <div style={styles.calcRow}>
                <span style={styles.calcLabel}>Total a Reembolsar:</span>
                <strong style={styles.calcVal}>{formatKz(totalRepayment)} Kz</strong>
              </div>
            </div>

            {/* PIN DE SEGURANÇA */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>PIN de Segurança da Carteira (4 dígitos) *</label>
              <div style={styles.passwordWrapper}>
                <input
                  type={showPin ? 'text' : 'password'}
                  placeholder="****"
                  maxLength={4}
                  value={securityPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                    setSecurityPin(val);
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
            </div>

            <button type="submit" style={styles.btnPrimary}>
              Solicitar Empréstimo Imediato →
            </button>
          </form>
        </div>

      </div>

      {/* ================= MODAL: APROVAÇÃO DE EMPRÉSTIMO CELEBRAÇÃO ================= */}
      {approvalModal && (
        <div style={styles.modalBackdrop} onClick={() => setApprovalModal(null)}>
          <div style={styles.modalCelebration} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center' }}>
              <img src={Logo} alt="SkyBank" style={{ width: '44px', height: '44px', borderRadius: '50%', marginBottom: '8px' }} />
              <div style={styles.celebrationIcon}>🎉</div>
              <h3 style={{ margin: '14px 0 4px 0', fontSize: '20px', color: '#10b981' }}>
                Empréstimo Aprovado com Sucesso!
              </h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 16px 0' }}>
                O valor foi depositado instantaneamente na tua carteira digital SkyBank.
              </p>

              <div style={styles.receiptBox}>
                <div style={styles.receiptRow}>
                  <span style={styles.receiptLabel}>Código do Contrato:</span>
                  <strong style={styles.receiptVal}>{approvalModal.code}</strong>
                </div>
                <div style={styles.receiptRow}>
                  <span style={styles.receiptLabel}>Montante Creditado:</span>
                  <strong style={{ ...styles.receiptVal, color: '#10b981' }}>
                    +{formatKz(approvalModal.totalAmount)} Kz
                  </strong>
                </div>
                <div style={styles.receiptRow}>
                  <span style={styles.receiptLabel}>Prazo:</span>
                  <span style={styles.receiptVal}>{approvalModal.termMonths} Meses</span>
                </div>
                <div style={styles.receiptRow}>
                  <span style={styles.receiptLabel}>Prestação Mensal:</span>
                  <span style={styles.receiptVal}>{formatKz(approvalModal.monthlyPayment)} Kz</span>
                </div>
                <div style={styles.receiptRow}>
                  <span style={styles.receiptLabel}>Primeira Parcela:</span>
                  <span style={styles.receiptVal}>{approvalModal.nextDueDate}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setApprovalModal(null)}
                style={{ ...styles.btnPrimary, width: '100%', marginTop: '16px' }}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CRONOGRAMA DE PRESTAÇÕES ================= */}
      {scheduleModalOpen && (
        <div style={styles.modalBackdrop} onClick={() => setScheduleModalOpen(false)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Cronograma de Pagamento do Empréstimo</h3>
              <button onClick={() => setScheduleModalOpen(false)} style={styles.modalCloseBtn}>✕</button>
            </div>

            <div style={{ margin: '14px 0', maxHeight: '50vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {installmentsSchedule.map((inst) => (
                  <div
                    key={inst.number}
                    style={{
                      ...styles.scheduleRow,
                      borderLeft: inst.paid
                        ? '3px solid #10b981'
                        : inst.current
                        ? '3px solid #0070f3'
                        : '3px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '13px', color: '#ffffff' }}>Parcela {inst.number}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Data: {inst.date}</div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffffff' }}>
                        {formatKz(inst.amount)} Kz
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          color: inst.paid ? '#10b981' : inst.current ? '#0070f3' : '#64748b',
                        }}
                      >
                        {inst.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setScheduleModalOpen(false)}
              style={{ ...styles.btnSecondary, width: '100%' }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONFIRMAR AMORTIZAÇÃO ================= */}
      {repayConfirmModal && (
        <div style={styles.modalBackdrop} onClick={() => setRepayConfirmModal(null)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Confirmar Amortização de Parcela</h3>
              <button onClick={() => setRepayConfirmModal(null)} style={styles.modalCloseBtn}>✕</button>
            </div>

            <div style={{ margin: '16px 0' }}>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.4' }}>
                Tem a certeza de que deseja debitar <strong>{formatKz(repayConfirmModal.monthlyPayment)} Kz</strong> da sua carteira para abater o empréstimo {repayConfirmModal.code}?
              </p>

              <div style={styles.calcSummaryBox}>
                <div style={styles.calcRow}>
                  <span style={styles.calcLabel}>Saldo Atual da Carteira:</span>
                  <span style={styles.calcVal}>{formatKz(user.balance)} Kz</span>
                </div>
                <div style={styles.calcRow}>
                  <span style={styles.calcLabel}>Valor a Debitar:</span>
                  <strong style={{ ...styles.calcVal, color: '#ef4444' }}>
                    - {formatKz(repayConfirmModal.monthlyPayment)} Kz
                  </strong>
                </div>
                <div style={styles.calcRow}>
                  <span style={styles.calcLabel}>Saldo Após Pagamento:</span>
                  <strong style={{ ...styles.calcVal, color: '#10b981' }}>
                    {formatKz(user.balance - repayConfirmModal.monthlyPayment)} Kz
                  </strong>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                style={styles.btnSecondary}
                onClick={() => setRepayConfirmModal(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                style={styles.btnPrimary}
                onClick={() => handleRepay(repayConfirmModal)}
              >
                Confirmar Pagamento
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}

// ESTILOS ESPECÍFICOS PRESERVANDO TODA A IDENTIDADE VISUAL
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
  tierBanner: {
    backgroundColor: '#071022',
    border: '1px solid rgba(20, 120, 178, 0.25)',
    borderRadius: '12px',
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '18px',
    flexWrap: 'wrap',
    gap: '14px',
    backgroundImage: 'linear-gradient(135deg, rgba(11, 17, 32, 0.9) 0%, rgba(20, 120, 178, 0.12) 100%)',
  },
  tierIconBadge: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    backgroundColor: '#0070f3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    boxShadow: '0 0 15px rgba(0, 112, 243, 0.4)',
  },
  tierComparison: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  tierMiniItem: {
    backgroundColor: '#0a162e',
    border: '1px solid rgba(20, 120, 178, 0.2)',
    borderRadius: '8px',
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1.3fr',
    gap: '16px',
  },
  card: {
    backgroundColor: '#071022',
    border: '1px solid rgba(20, 120, 178, 0.25)',
    borderRadius: '12px',
    padding: '18px',
    boxSizing: 'border-box',
  },
  cardHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: '600',
    margin: 0,
    color: '#ffffff',
  },
  cardSubtitle: {
    fontSize: '11px',
    color: '#64748b',
  },
  statusBadgeActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#10b981',
    border: '1px solid #10b981',
    borderRadius: '20px',
    padding: '2px 8px',
    fontSize: '10px',
    fontWeight: 'bold',
  },
  progressBarTrack: {
    height: '6px',
    backgroundColor: '#0a162e',
    borderRadius: '3px',
    overflow: 'hidden',
    marginTop: '6px',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0070f3',
    transition: 'width 0.3s ease',
  },
  loanDetailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#0a1429',
    borderRadius: '8px',
  },
  loanDetailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  loanDetailLabel: {
    fontSize: '10px',
    color: '#64748b',
  },
  loanDetailVal: {
    fontSize: '12px',
    color: '#ffffff',
  },
  autoDebitCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '14px',
    padding: '12px',
    backgroundColor: '#0a162e',
    border: '1px solid rgba(20, 120, 178, 0.2)',
    borderRadius: '8px',
  },
  switch: {
    position: 'relative',
    display: 'inline-block',
    width: '36px',
    height: '18px',
  },
  slider: {
    position: 'absolute',
    cursor: 'pointer',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#0070f3',
    borderRadius: '18px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    marginTop: '12px',
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
  sliderInput: {
    width: '100%',
    cursor: 'pointer',
    accentColor: '#0070f3',
  },
  termButtonsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '8px',
  },
  termBtn: {
    backgroundColor: '#0a1429',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#94a3b8',
    borderRadius: '8px',
    padding: '8px',
    fontSize: '11px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  termBtnActive: {
    backgroundColor: '#0070f3',
    borderColor: '#0070f3',
    color: '#ffffff',
  },
  selectInput: {
    backgroundColor: '#0a1429',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#ffffff',
    fontSize: '13px',
    outline: 'none',
    cursor: 'pointer',
  },
  calcSummaryBox: {
    backgroundColor: '#0a1429',
    border: '1px solid rgba(20, 120, 178, 0.3)',
    borderRadius: '8px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  calcRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
  },
  calcLabel: {
    color: '#94a3b8',
  },
  calcVal: {
    color: '#ffffff',
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
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    padding: '10px 14px',
    marginTop: '10px',
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
  modalCelebration: {
    backgroundColor: '#071022',
    border: '2px solid #10b981',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '440px',
    padding: '24px',
    boxShadow: '0 20px 30px rgba(16, 185, 129, 0.2)',
  },
  celebrationIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    margin: '0 auto',
  },
  receiptBox: {
    backgroundColor: '#0a1429',
    borderRadius: '8px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    textAlign: 'left',
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
  },
  modalCard: {
    backgroundColor: '#071022',
    border: '1px solid rgba(20, 120, 178, 0.3)',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '460px',
    padding: '20px',
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
  scheduleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    backgroundColor: '#0a1429',
    borderRadius: '6px',
  },
};
