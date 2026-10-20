import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useBank } from '../../contexts/BankContext';
import '../../styles/SkyBankShared.css';

export default function AdminDashboard() {
  const {
    adminUsers,
    pendingLoans,
    adminApproveLoan,
    adminRejectLoan,
    adminChangeUserStatus,
    adminAdjustUserBalance,
    transactions,
    navigateTo,
  } = useBank();

  const [activeTab, setActiveTab] = useState('pedidos'); // 'pedidos' | 'contas' | 'auditoria' | 'limites'
  const [userSearch, setUserSearch] = useState('');
  const [rejectModalLoan, setRejectModalLoan] = useState(null);
  const [rejectReason, setRejectReason] = useState('Capacidade de endividamento insuficiente');
  const [statusChangeUser, setStatusChangeUser] = useState(null);
  const [newStatus, setNewStatus] = useState('Activa');
  const [statusReason, setStatusReason] = useState('Revisão administrativa de conformidade');

  const formatKz = (val) => {
    return Number(val || 0).toLocaleString('pt-AO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (rejectModalLoan) {
      adminRejectLoan(rejectModalLoan.id, rejectReason);
      setRejectModalLoan(null);
    }
  };

  const handleConfirmStatusChange = (e) => {
    e.preventDefault();
    if (statusChangeUser) {
      adminChangeUserStatus(statusChangeUser.id, newStatus, statusReason);
      setStatusChangeUser(null);
    }
  };

  const filteredUsers = (adminUsers || []).filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.accountNumber.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.phone && u.phone.includes(userSearch))
  );

  return (
    <DashboardLayout activeTab="Admin">
      <div style={styles.container}>
        {/* BANNER DO BACKOFFICE SKYBANK */}
        <div style={styles.adminBanner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={styles.adminBadgeIcon}>🛡️</div>
            <div>
              <span style={styles.badgeTop}>MÓDULO DE GESTÃO BANCÁRIA & CONFORMIDADE</span>
              <h1 style={styles.pageTitle}>Portal Administrativo SkyBank</h1>
              <p style={styles.pageSubtitle}>
                Supervisão de liquidez, estados de conta (Activa, Suspensa, Bloqueada, Encerrada), aprovação de crédito e auditoria.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigateTo('dashboard')}
            style={styles.btnSwitchUser}
          >
            ← Voltar à Área de Cliente
          </button>
        </div>

        {/* METRICAS GLOBAIS DE OPERAÇÃO DO BANCO */}
        <div style={styles.kpiGrid}>
          <div style={styles.kpiCard}>
            <span style={styles.kpiLabel}>Volume em Custódia</span>
            <div style={styles.kpiVal}>
              2.450.890.000 <span style={{ color: '#0070f3', fontSize: '14px' }}>Kz</span>
            </div>
            <span style={styles.kpiTrendUp}>▲ +8,4% esta semana</span>
          </div>

          <div style={styles.kpiCard}>
            <span style={styles.kpiLabel}>Carteira de Crédito Ativa</span>
            <div style={styles.kpiVal}>
              780.450.000 <span style={{ color: '#0070f3', fontSize: '14px' }}>Kz</span>
            </div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Taxa de Encargo: 10% + 2.500 Kz</span>
          </div>

          <div style={styles.kpiCard}>
            <span style={styles.kpiLabel}>Contas Supervisionadas</span>
            <div style={styles.kpiVal}>{(adminUsers || []).length}</div>
            <span style={{ fontSize: '11px', color: '#10b981' }}>Mini • Básica • Intermédia • Completa</span>
          </div>

          <div style={styles.kpiCard}>
            <span style={styles.kpiLabel}>Pedidos de Crédito Pendentes</span>
            <div style={{ ...styles.kpiVal, color: (pendingLoans || []).length > 0 ? '#f59e0b' : '#10b981' }}>
              {(pendingLoans || []).length}
            </div>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Aguardam despacho</span>
          </div>
        </div>

        {/* NAVEGAÇÃO DE ABAS */}
        <div style={styles.navTabs}>
          <button
            onClick={() => setActiveTab('pedidos')}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'pedidos' ? styles.tabBtnActive : {}),
            }}
          >
            <span>📋</span> Fila de Empréstimos ({(pendingLoans || []).length})
          </button>
          <button
            onClick={() => setActiveTab('contas')}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'contas' ? styles.tabBtnActive : {}),
            }}
          >
            <span>👥</span> Gestão de Contas & Estados ({(adminUsers || []).length})
          </button>
          <button
            onClick={() => setActiveTab('auditoria')}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'auditoria' ? styles.tabBtnActive : {}),
            }}
          >
            <span>🔍</span> Auditoria de Transações & Histórico
          </button>
          <button
            onClick={() => setActiveTab('limites')}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'limites' ? styles.tabBtnActive : {}),
            }}
          >
            <span>📐</span> Matriz de Regras & Níveis
          </button>
        </div>

        {/* ================= ABA 1: APROVAÇÃO DE EMPRÉSTIMOS ================= */}
        {activeTab === 'pedidos' && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.cardTitle}>Pedidos de Empréstimo Pendentes de Análise</h3>
                <p style={styles.cardDesc}>
                  Validação dos limites de crédito por nível (Básica: 50k-150k | Intermédia: 200k-500k | Completa: 600k-1M).
                </p>
              </div>
            </div>

            {(pendingLoans || []).length === 0 ? (
              <div style={styles.emptyState}>
                <span style={{ fontSize: '36px' }}>🎉</span>
                <strong style={{ fontSize: '15px', color: '#ffffff', margin: '10px 0 2px 0' }}>
                  Nenhum pedido pendente na fila!
                </strong>
                <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                  Todos os pedidos de crédito submetidos foram despachados.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                {pendingLoans.map((loan) => (
                  <div key={loan.id} style={styles.loanPendingItem}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '14px', color: '#ffffff' }}>{loan.userName}</strong>
                        <span style={styles.codeBadge}>{loan.accountNumber}</span>
                        <span style={styles.tierTag}>Nível {loan.tier}</span>
                        <span style={styles.riskBadge}>Risco: {loan.riskScore || 'Normal'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '12px', color: '#94a3b8', flexWrap: 'wrap' }}>
                        <span>Finalidade: <strong style={{ color: '#ffffff' }}>{loan.purpose}</strong></span>
                        <span>Prazo: <strong style={{ color: '#ffffff' }}>{loan.termMonths} meses</strong></span>
                        <span>Taxa de Abertura: <strong style={{ color: '#06b6d4' }}>2.500 Kz</strong></span>
                        <span>Juros (10%): <strong style={{ color: '#f59e0b' }}>{formatKz(loan.amount * 0.1)} Kz</strong></span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ fontSize: '18px', color: '#0070f3', display: 'block' }}>
                        {formatKz(loan.amount)} Kz
                      </strong>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{loan.requestedDate}</span>
                    </div>

                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => adminApproveLoan(loan.id)}
                        style={styles.btnApprove}
                      >
                        ✓ Aprovar
                      </button>
                      <button
                        onClick={() => setRejectModalLoan(loan)}
                        style={styles.btnReject}
                      >
                        ✕ Recusar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= ABA 2: GESTÃO DE CONTAS & ESTADOS ================= */}
        {activeTab === 'contas' && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.cardTitle}>Supervisão de Contas e Estados Operacionais</h3>
                <p style={styles.cardDesc}>
                  Controlo dos 4 estados de conta oficiais: Activa, Suspensa (só consulta e recebe), Bloqueada e Encerrada.
                </p>
              </div>
              <input
                type="text"
                placeholder="Pesquisar por nome, conta, email ou telefone..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            <div style={{ overflowX: 'auto', marginTop: '16px' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>Cliente / Titular</th>
                    <th style={styles.th}>Conta SkyBank</th>
                    <th style={styles.th}>Faixa / Nível</th>
                    <th style={styles.th}>Estado Oficial</th>
                    <th style={styles.th}>Limite Mensal</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Saldo da Carteira</th>
                    <th style={{ ...styles.th, textAlign: 'center' }}>Ações Administrativas</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} style={styles.tableRow}>
                      <td style={styles.td}>
                        <strong style={{ fontSize: '13px', color: '#ffffff', display: 'block' }}>
                          {u.name}
                        </strong>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{u.email} • {u.phone}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.codeBadge}>{u.accountNumber}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.tierTag}>{u.tier}</span>
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 'bold',
                            padding: '3px 8px',
                            borderRadius: '10px',
                            backgroundColor:
                              u.status === 'Activa'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : u.status === 'Suspensa'
                                ? 'rgba(245, 158, 11, 0.15)'
                                : 'rgba(239, 68, 68, 0.15)',
                            color:
                              u.status === 'Activa'
                                ? '#10b981'
                                : u.status === 'Suspensa'
                                ? '#f59e0b'
                                : '#ef4444',
                          }}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {u.tier === 'Mini'
                            ? '50.000 Kz'
                            : u.tier === 'Básica'
                            ? '100.000 Kz'
                            : u.tier === 'Intermédia'
                            ? '200.000 Kz'
                            : '800.000 Kz'}
                        </span>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <strong style={{ fontSize: '13px', color: '#ffffff' }}>
                          {formatKz(u.balance)} Kz
                        </strong>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button
                            onClick={() => {
                              setStatusChangeUser(u);
                              setNewStatus(u.status);
                            }}
                            style={styles.tableActionBtn}
                            title="Alterar estado da conta"
                          >
                            Alterar Estado
                          </button>
                          <button
                            onClick={() => adminAdjustUserBalance(u.id, 20000)}
                            style={{
                              ...styles.tableActionBtn,
                              color: '#06b6d4',
                              borderColor: 'rgba(6, 182, 212, 0.3)',
                            }}
                            title="Injetar +20.000 Kz de teste"
                          >
                            +20k Kz
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= ABA 3: AUDITORIA DE TRANSAÇÕES ================= */}
        {activeTab === 'auditoria' && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.cardTitle}>Auditoria Geral de Transações Financeiras</h3>
                <p style={styles.cardDesc}>
                  Histórico verificável de todas as operações realizadas na plataforma com registo imutável.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
              {transactions.map((tx) => (
                <div key={tx.id} style={styles.auditRow}>
                  <div style={styles.auditBadge}>BNA OK</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '13px', color: '#ffffff' }}>{tx.title}</strong>
                      <span style={styles.codeBadge}>{tx.ref}</span>
                      <span style={{ fontSize: '11px', color: '#10b981' }}>{tx.status}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                      {tx.sub} • {tx.fullDate || tx.date}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <strong
                      style={{
                        fontSize: '14px',
                        color: tx.isPositive ? '#10b981' : '#cbd5e1',
                      }}
                    >
                      {tx.isPositive ? '+' : '-'} {formatKz(tx.amount)} Kz
                    </strong>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Taxa: 0 Kz</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= ABA 4: MATRIZ DE REGRAS E NÍVEIS ================= */}
        {activeTab === 'limites' && (
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Matriz Oficial de Níveis do SkyBank (Requisitos v1.0)</h3>
            <p style={styles.cardDesc}>
              Regras consolidadas aplicadas automaticamente pelo sistema em todas as transações.
            </p>

            <div style={{ overflowX: 'auto', marginTop: '16px' }}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>Nível</th>
                    <th style={styles.th}>Faixa Etária</th>
                    <th style={styles.th}>Limite de Saldo</th>
                    <th style={styles.th}>Limite Mensal (Dias 1-30)</th>
                    <th style={styles.th}>Mínimo por Transação</th>
                    <th style={styles.th}>Gama de Empréstimos</th>
                    <th style={styles.th}>Taxa e Juros</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={styles.tableRow}>
                    <td style={styles.td}><strong style={{ color: '#06b6d4' }}>Mini</strong></td>
                    <td style={styles.td}>12 a 14 anos</td>
                    <td style={styles.td}>200.000 Kz</td>
                    <td style={styles.td}>50.000 Kz</td>
                    <td style={styles.td}>200 Kz</td>
                    <td style={styles.td}><span style={{ color: '#ef4444' }}>Não autorizados</span></td>
                    <td style={styles.td}>—</td>
                  </tr>
                  <tr style={styles.tableRow}>
                    <td style={styles.td}><strong style={{ color: '#0070f3' }}>Básica</strong></td>
                    <td style={styles.td}>A partir dos 15 anos</td>
                    <td style={styles.td}>500.000 Kz</td>
                    <td style={styles.td}>100.000 Kz</td>
                    <td style={styles.td}>200 Kz</td>
                    <td style={styles.td}>50.000 a 150.000 Kz</td>
                    <td style={styles.td}>10% + 2.500 Kz taxa</td>
                  </tr>
                  <tr style={styles.tableRow}>
                    <td style={styles.td}><strong style={{ color: '#cbd5e1' }}>Intermédia</strong></td>
                    <td style={styles.td}>Conforme elegibilidade</td>
                    <td style={styles.td}>1.000.000 Kz</td>
                    <td style={styles.td}>200.000 Kz</td>
                    <td style={styles.td}>200 Kz</td>
                    <td style={styles.td}>200.000 a 500.000 Kz</td>
                    <td style={styles.td}>10% + 2.500 Kz taxa</td>
                  </tr>
                  <tr style={styles.tableRow}>
                    <td style={styles.td}><strong style={{ color: '#f59e0b' }}>Completa</strong></td>
                    <td style={styles.td}>Conforme elegibilidade</td>
                    <td style={styles.td}>Sem limite</td>
                    <td style={styles.td}>800.000 Kz</td>
                    <td style={styles.td}>200 Kz</td>
                    <td style={styles.td}>600.000 a 1.000.000 Kz</td>
                    <td style={styles.td}>10% + 2.500 Kz taxa</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= MODAL: RECUSAR EMPRÉSTIMO ================= */}
        {rejectModalLoan && (
          <div style={styles.modalBackdrop} onClick={() => setRejectModalLoan(null)}>
            <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#ef4444' }}>Recusar Pedido de Crédito</h3>
                <button onClick={() => setRejectModalLoan(null)} style={styles.modalCloseBtn}>✕</button>
              </div>

              <form onSubmit={handleConfirmReject} style={{ marginTop: '14px' }}>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Indique o motivo formal da recusa para o cliente{' '}
                  <strong style={{ color: '#ffffff' }}>{rejectModalLoan.userName}</strong> ({formatKz(rejectModalLoan.amount)} Kz):
                </p>

                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={styles.selectField}
                >
                  <option value="Capacidade de endividamento insuficiente">Capacidade de endividamento insuficiente</option>
                  <option value="Histórico de pagamentos irregular">Histórico de pagamentos irregular</option>
                  <option value="Limite do escalão atingido no período">Limite do escalão atingido no período</option>
                  <option value="Documentação de suporte pendente">Documentação de suporte pendente</option>
                </select>

                <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
                  <button type="submit" style={styles.btnDanger}>
                    Confirmar Recusa
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectModalLoan(null)}
                    style={styles.btnSecondary}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= MODAL: ALTERAR ESTADO DA CONTA ================= */}
        {statusChangeUser && (
          <div style={styles.modalBackdrop} onClick={() => setStatusChangeUser(null)}>
            <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0070f3' }}>Alterar Estado da Conta</h3>
                <button onClick={() => setStatusChangeUser(null)} style={styles.modalCloseBtn}>✕</button>
              </div>

              <form onSubmit={handleConfirmStatusChange} style={{ marginTop: '14px' }}>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                  A alterar o estado operacional de{' '}
                  <strong style={{ color: '#ffffff' }}>{statusChangeUser.name}</strong> ({statusChangeUser.accountNumber}):
                </p>

                <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginTop: '10px' }}>
                  Novo Estado da Conta:
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={styles.selectField}
                >
                  <option value="Activa">Activa (Acesso pleno)</option>
                  <option value="Suspensa">Suspensa (Apenas consulta e recebe dinheiro)</option>
                  <option value="Bloqueada">Bloqueada (Operações bloqueadas)</option>
                  <option value="Encerrada">Encerrada (Conta desativada)</option>
                </select>

                <label style={{ fontSize: '12px', color: '#cbd5e1', display: 'block', marginTop: '12px' }}>
                  Motivo da Alteração:
                </label>
                <input
                  type="text"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  style={styles.inputField}
                  required
                />

                <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
                  <button type="submit" style={styles.btnPrimary}>
                    Gravar Novo Estado
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusChangeUser(null)}
                    style={styles.btnSecondary}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
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
  adminBanner: {
    backgroundColor: '#071022',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '12px',
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
  },
  adminBadgeIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  },
  badgeTop: {
    fontSize: '10px',
    fontWeight: 'bold',
    color: '#ef4444',
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
  btnSwitchUser: {
    backgroundColor: '#0070f3',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 18px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '14px',
  },
  kpiCard: {
    backgroundColor: '#071022',
    border: '1px solid rgba(20, 120, 178, 0.2)',
    borderRadius: '10px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  kpiLabel: {
    fontSize: '11px',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  kpiVal: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#ffffff',
  },
  kpiTrendUp: {
    fontSize: '11px',
    color: '#10b981',
    fontWeight: '500',
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
  card: {
    backgroundColor: '#071022',
    border: '1px solid rgba(20, 120, 178, 0.2)',
    borderRadius: '12px',
    padding: '22px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
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
  emptyState: {
    textAlign: 'center',
    padding: '40px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  loanPendingItem: {
    backgroundColor: '#0a152e',
    border: '1px solid rgba(20, 120, 178, 0.2)',
    borderRadius: '10px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  codeBadge: {
    fontSize: '11px',
    fontFamily: 'monospace',
    backgroundColor: '#071022',
    color: '#06b6d4',
    padding: '2px 6px',
    borderRadius: '4px',
    border: '1px solid rgba(6, 182, 212, 0.2)',
  },
  tierTag: {
    fontSize: '10px',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    color: '#f59e0b',
    padding: '2px 6px',
    borderRadius: '6px',
    fontWeight: 'bold',
  },
  riskBadge: {
    fontSize: '10px',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#10b981',
    padding: '2px 6px',
    borderRadius: '6px',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  btnApprove: {
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 14px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  btnReject: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '6px',
    padding: '8px 14px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  searchInput: {
    backgroundColor: '#0a152e',
    border: '1px solid rgba(20, 120, 178, 0.25)',
    borderRadius: '8px',
    padding: '8px 14px',
    color: '#ffffff',
    fontSize: '12px',
    width: '280px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeader: {
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
  tableRow: {
    transition: 'background 0.2s',
  },
  tableActionBtn: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(0, 112, 243, 0.3)',
    color: '#0070f3',
    borderRadius: '6px',
    padding: '4px 8px',
    fontSize: '11px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  auditRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#0a152e',
    border: '1px solid rgba(20, 120, 178, 0.15)',
    borderRadius: '8px',
    padding: '12px 14px',
  },
  auditBadge: {
    fontSize: '9px',
    fontWeight: 'bold',
    color: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    padding: '3px 6px',
    borderRadius: '4px',
    letterSpacing: '0.5px',
  },
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
    maxWidth: '440px',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    paddingBottom: '10px',
  },
  modalCloseBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: '18px',
    cursor: 'pointer',
  },
  selectField: {
    width: '100%',
    backgroundColor: '#0a152e',
    border: '1px solid rgba(20, 120, 178, 0.25)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#ffffff',
    fontSize: '13px',
    boxSizing: 'border-box',
    marginTop: '6px',
  },
  inputField: {
    width: '100%',
    backgroundColor: '#0a152e',
    border: '1px solid rgba(20, 120, 178, 0.25)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#ffffff',
    fontSize: '13px',
    boxSizing: 'border-box',
    marginTop: '6px',
  },
  btnPrimary: {
    backgroundColor: '#0070f3',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  btnDanger: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  btnSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#cbd5e1',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '12px',
    cursor: 'pointer',
  },
};
