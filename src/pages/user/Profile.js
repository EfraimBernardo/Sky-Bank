import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useBank } from '../../contexts/BankContext';
import '../../styles/SkyBankShared.css';

export default function ProfileScreen() {
  const {
    user,
    updateUserProfile,
    updateUserSecurity,
    updateUserLimits,
    requestTierUpgrade,
    logoutUser,
    showToastNotification,
  } = useBank();

  const [activeTab, setActiveTab] = useState('dados'); // 'dados' | 'seguranca' | 'niveis' | 'preferencias'

  // Form Dados Pessoais
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [address, setAddress] = useState(user.address);
  const [province, setProvince] = useState(user.province || 'Luanda');
  const [municipality, setMunicipality] = useState(user.municipality || 'Talatona');

  // Form Segurança
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [twoFactor, setTwoFactor] = useState(user.twoFactorEnabled ?? true);
  const [biometrics, setBiometrics] = useState(user.biometricsEnabled ?? true);

  // Form Limites
  const [dailyTransferLimit, setDailyTransferLimit] = useState(user.dailyTransferLimit || 1000000);
  const [dailyWithdrawLimit, setDailyWithdrawLimit] = useState(user.dailyWithdrawLimit || 250000);

  // Preferências
  const [emailNotifs, setEmailNotifs] = useState(user.emailNotifications ?? true);
  const [smsNotifs, setSmsNotifs] = useState(user.smsNotifications ?? true);

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

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUserProfile({
      name,
      email,
      phone,
      address,
      province,
      municipality,
    });
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToastNotification('As palavras-passe não coincidem.', 'error');
      return;
    }
    const res = updateUserSecurity({
      currentPassword,
      newPassword,
    });
    if (res.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      showToastNotification(res.message, 'error');
    }
  };

  const handleChangePin = (e) => {
    e.preventDefault();
    if (newPin !== confirmPin) {
      showToastNotification('Os novos PINs não coincidem.', 'error');
      return;
    }
    const res = updateUserSecurity({
      currentPin,
      newPin,
    });
    if (res.success) {
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } else {
      showToastNotification(res.message, 'error');
    }
  };

  const handleSaveLimits = (e) => {
    e.preventDefault();
    updateUserLimits({
      dailyTransferLimit,
      dailyWithdrawLimit,
    });
  };

  const tiersData = [
    {
      name: 'Basic',
      icon: '👑',
      limit: 250000,
      badge: 'Atual',
      color: '#0070f3',
      features: [
        'Cartão Virtual SkyBank Visa grátis',
        'Transferências internas ilimitadas (Taxa 0)',
        'Limite de crédito até 250.000 Kz',
        'Apoio via assistente virtual 24/7',
      ],
    },
    {
      name: 'Silver',
      icon: '🥈',
      limit: 1000000,
      badge: user.tier === 'Silver' ? 'Atual' : 'Upgrade',
      color: '#94a3b8',
      features: [
        'Todos os benefícios do nível Basic',
        'Cartão de Débito Físico Multicaixa gratuito',
        'Limite de crédito expandido até 1.000.000 Kz',
        'Taxas de juro bonificadas em empréstimos (7.5%)',
        'Atendimento telefónico prioritário',
      ],
    },
    {
      name: 'Gold VIP',
      icon: '💎',
      limit: 5000000,
      badge: user.tier === 'Gold VIP' ? 'Atual' : 'Exclusivo',
      color: '#f59e0b',
      features: [
        'Todos os benefícios do nível Silver',
        'Gestor de conta SkyBank dedicado',
        'Limite de crédito de elite até 5.000.000 Kz',
        'Acesso VIP a salas lounge de aeroportos',
        'Isenção total de taxas em levantamentos internacionais',
      ],
    },
  ];

  return (
    <DashboardLayout activeTab="Perfil">
      <div style={styles.container}>
        {/* CARD HERO DE IDENTIDADE */}
        <div style={styles.heroCard}>
          <div style={styles.heroLeft}>
            <div style={styles.avatarCircle}>
              <span style={{ fontSize: '30px' }}>👤</span>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={styles.userName}>{user.name}</h1>
                <span style={styles.statusVerified}>Verificado ✓</span>
              </div>
              <p style={styles.userEmail}>{user.email} • {user.phone}</p>
              <div style={styles.metaRow}>
                <span style={styles.accountNumberBadge}>Conta: {user.accountNumber}</span>
                <span style={styles.tierBadge}>{user.tier} {user.tierIcon}</span>
                <span style={styles.dateBadge}>Membro desde: {user.createdAt || '2025'}</span>
              </div>
            </div>
          </div>

          <div style={styles.heroRight}>
            <button
              onClick={() => copyToClipboard(user.iban, 'IBAN')}
              style={styles.heroActionBtn}
            >
              Copiar IBAN
            </button>
            <button
              onClick={logoutUser}
              style={{ ...styles.heroActionBtn, borderColor: '#ef4444', color: '#ef4444' }}
            >
              Terminar Sessão
            </button>
          </div>
        </div>

        {/* NAVEGAÇÃO DE ABAS */}
        <div style={styles.navTabs}>
          <button
            onClick={() => setActiveTab('dados')}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'dados' ? styles.tabBtnActive : {}),
            }}
          >
            <span>👤</span> Dados Pessoais
          </button>
          <button
            onClick={() => setActiveTab('seguranca')}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'seguranca' ? styles.tabBtnActive : {}),
            }}
          >
            <span>🔐</span> Segurança & PIN
          </button>
          <button
            onClick={() => setActiveTab('niveis')}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'niveis' ? styles.tabBtnActive : {}),
            }}
          >
            <span>👑</span> Níveis & Limites
          </button>
          <button
            onClick={() => setActiveTab('preferencias')}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'preferencias' ? styles.tabBtnActive : {}),
            }}
          >
            <span>⚙️</span> Preferências & Dispositivos
          </button>
        </div>

        {/* ================= ABA 1: DADOS PESSOAIS ================= */}
        {activeTab === 'dados' && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div>
                <h3 style={styles.cardTitle}>Informações de Identificação e Contacto</h3>
                <p style={styles.cardDesc}>
                  Mantém os teus dados sempre atualizados para fins de conformidade bancária e notificações.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} style={{ marginTop: '20px' }}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Nome Completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={styles.inputField}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Endereço de Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.inputField}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Número de Telefone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={styles.inputField}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Documento de Identificação (BI / Passaporte)</label>
                  <input
                    type="text"
                    value={user.documentNumber}
                    disabled
                    style={{ ...styles.inputField, opacity: 0.7, cursor: 'not-allowed' }}
                  />
                  <span style={styles.inputTip}>Para alterar o BI, contacte o suporte oficial.</span>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Província</label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    style={styles.selectField}
                  >
                    <option value="Luanda">Luanda</option>
                    <option value="Benguela">Benguela</option>
                    <option value="Huambo">Huambo</option>
                    <option value="Huíla">Huíla</option>
                    <option value="Cabinda">Cabinda</option>
                    <option value="Cuanza Sul">Cuanza Sul</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Município</label>
                  <input
                    type="text"
                    value={municipality}
                    onChange={(e) => setMunicipality(e.target.value)}
                    style={styles.inputField}
                  />
                </div>

                <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
                  <label style={styles.label}>Morada Residencial Completa</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={styles.inputField}
                  />
                </div>
              </div>

              <button type="submit" style={{ ...styles.btnPrimary, marginTop: '16px' }}>
                Guardar Alterações Pessoais
              </button>
            </form>
          </div>
        )}

        {/* ================= ABA 2: SEGURANÇA & CREDENCIAIS ================= */}
        {activeTab === 'seguranca' && (
          <div style={styles.splitGrid}>
            {/* ALTERAR PALAVRA-PASSE */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Alterar Palavra-passe de Acesso</h3>
              <p style={styles.cardDesc}>Utiliza pelo menos 6 caracteres alfanuméricos fortes.</p>

              <form onSubmit={handleChangePassword} style={{ marginTop: '16px' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Palavra-passe Atual</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={styles.inputField}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Nova Palavra-passe</label>
                  <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={styles.inputField}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Confirmar Nova Palavra-passe</label>
                  <input
                    type="password"
                    placeholder="Repita a nova palavra-passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={styles.inputField}
                    required
                  />
                </div>

                <button type="submit" style={{ ...styles.btnPrimary, width: '100%', marginTop: '6px' }}>
                  Atualizar Palavra-passe
                </button>
              </form>
            </div>

            {/* ALTERAR PIN DA CARTEIRA & 2FA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>PIN da Carteira Digital (4 dígitos)</h3>
                <p style={styles.cardDesc}>
                  Necessário para autorizar transferências, pagamentos e levantamentos ATM.
                </p>

                <form onSubmit={handleChangePin} style={{ marginTop: '16px' }}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>PIN Atual (4 números)</label>
                    <input
                      type="password"
                      maxLength="4"
                      placeholder="••••"
                      value={currentPin}
                      onChange={(e) => setCurrentPin(e.target.value)}
                      style={styles.inputField}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Novo PIN</label>
                      <input
                        type="password"
                        maxLength="4"
                        placeholder="••••"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        style={styles.inputField}
                        required
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Confirmar PIN</label>
                      <input
                        type="password"
                        maxLength="4"
                        placeholder="••••"
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value)}
                        style={styles.inputField}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" style={{ ...styles.btnPrimary, width: '100%', marginTop: '6px' }}>
                    Alterar PIN de Segurança
                  </button>
                </form>
              </div>

              {/* TOGGLES BIOMETRIA E 2FA */}
              <div style={styles.card}>
                <h3 style={{ ...styles.cardTitle, fontSize: '14px', marginBottom: '14px' }}>
                  Mecanismos Adicionais de Proteção
                </h3>

                <div style={styles.toggleRow}>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#ffffff', display: 'block' }}>
                      Autenticação em Dois Passos (2FA)
                    </strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      Código de confirmação por SMS para acessos em novos navegadores
                    </span>
                  </div>
                  <label style={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={twoFactor}
                      onChange={() => {
                        const val = !twoFactor;
                        setTwoFactor(val);
                        showToastNotification(val ? '2FA Ativado.' : '2FA Desativado.');
                      }}
                    />
                    <span style={styles.toggleSlider}></span>
                  </label>
                </div>

                <div style={{ ...styles.toggleRow, marginTop: '14px' }}>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#ffffff', display: 'block' }}>
                      Biometria (FaceID / Impressão Digital)
                    </strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      Permitir desbloqueio rápido em dispositivos móveis compatíveis
                    </span>
                  </div>
                  <label style={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={biometrics}
                      onChange={() => {
                        const val = !biometrics;
                        setBiometrics(val);
                        showToastNotification(val ? 'Biometria Ativada.' : 'Biometria Desativada.');
                      }}
                    />
                    <span style={styles.toggleSlider}></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= ABA 3: NÍVEIS & LIMITES ================= */}
        {activeTab === 'niveis' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* CARDS COMPARATIVOS DE NÍVEIS */}
            <div style={styles.tiersGrid}>
              {tiersData.map((tier) => {
                const isCurrent = user.tier === tier.name;
                return (
                  <div
                    key={tier.name}
                    style={{
                      ...styles.tierCard,
                      borderColor: isCurrent ? '#0070f3' : 'rgba(20, 120, 178, 0.2)',
                      boxShadow: isCurrent ? '0 0 25px rgba(0, 112, 243, 0.2)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '24px' }}>{tier.icon}</span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 'bold',
                          padding: '3px 8px',
                          borderRadius: '8px',
                          backgroundColor: isCurrent ? 'rgba(0, 112, 243, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                          color: isCurrent ? '#0070f3' : '#94a3b8',
                        }}
                      >
                        {tier.badge}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '18px', color: '#ffffff', margin: '10px 0 2px 0' }}>{tier.name}</h3>
                    <div style={{ fontSize: '13px', color: '#06b6d4', fontWeight: 'bold' }}>
                      Até {formatKz(tier.limit)} Kz de crédito
                    </div>

                    <ul style={styles.tierFeaturesList}>
                      {tier.features.map((feat, idx) => (
                        <li key={idx} style={styles.tierFeatureItem}>
                          <span style={{ color: '#10b981' }}>✓</span> {feat}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => {
                        if (isCurrent) {
                          showToastNotification('Este já é o teu nível atual.');
                        } else {
                          requestTierUpgrade(tier.name);
                        }
                      }}
                      disabled={isCurrent}
                      style={{
                        ...styles.btnTierAction,
                        backgroundColor: isCurrent ? 'rgba(255, 255, 255, 0.05)' : '#0070f3',
                        color: isCurrent ? '#64748b' : '#ffffff',
                        cursor: isCurrent ? 'default' : 'pointer',
                      }}
                    >
                      {isCurrent ? 'Nível Ativo' : `Solicitar Nível ${tier.name}`}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* GESTÃO DE LIMITES DIÁRIOS */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Gestão de Limites Operacionais Diários</h3>
              <p style={styles.cardDesc}>
                Ajuste os valores máximos autorizados para movimentação dentro das políticas do seu nível.
              </p>

              <form onSubmit={handleSaveLimits} style={{ marginTop: '16px', maxWidth: '600px' }}>
                <div style={styles.formGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={styles.label}>Limite Diário de Transferências</label>
                    <strong style={{ fontSize: '13px', color: '#0070f3' }}>
                      {formatKz(dailyTransferLimit)} Kz
                    </strong>
                  </div>
                  <input
                    type="range"
                    min="100000"
                    max="5000000"
                    step="50000"
                    value={dailyTransferLimit}
                    onChange={(e) => setDailyTransferLimit(e.target.value)}
                    style={styles.rangeInput}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b' }}>
                    <span>100.000 Kz</span>
                    <span>5.000.000 Kz</span>
                  </div>
                </div>

                <div style={{ ...styles.formGroup, marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={styles.label}>Limite Diário de Levantamentos no ATM</label>
                    <strong style={{ fontSize: '13px', color: '#10b981' }}>
                      {formatKz(dailyWithdrawLimit)} Kz
                    </strong>
                  </div>
                  <input
                    type="range"
                    min="50000"
                    max="1000000"
                    step="25000"
                    value={dailyWithdrawLimit}
                    onChange={(e) => setDailyWithdrawLimit(e.target.value)}
                    style={styles.rangeInput}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b' }}>
                    <span>50.000 Kz</span>
                    <span>1.000.000 Kz</span>
                  </div>
                </div>

                <button type="submit" style={{ ...styles.btnPrimary, marginTop: '12px' }}>
                  Guardar Novos Limites
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= ABA 4: PREFERÊNCIAS & SESSÕES ================= */}
        {activeTab === 'preferencias' && (
          <div style={styles.splitGrid}>
            {/* NOTIFICAÇÕES & IDIOMA */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Canais de Notificação</h3>
              <p style={styles.cardDesc}>Escolha como deseja receber alertas de movimentos e segurança.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '18px' }}>
                <div style={styles.toggleRow}>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#ffffff', display: 'block' }}>
                      Alertas por SMS
                    </strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      Receber SMS imediato em cada débito ou crédito na conta
                    </span>
                  </div>
                  <label style={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={smsNotifs}
                      onChange={() => {
                        const val = !smsNotifs;
                        setSmsNotifs(val);
                        showToastNotification(val ? 'Alertas SMS ativados.' : 'Alertas SMS desativados.');
                      }}
                    />
                    <span style={styles.toggleSlider}></span>
                  </label>
                </div>

                <div style={styles.toggleRow}>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#ffffff', display: 'block' }}>
                      Extrato Mensal por Email
                    </strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      Receber extrato bancário consolidado no 1º dia de cada mês
                    </span>
                  </div>
                  <label style={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={emailNotifs}
                      onChange={() => {
                        const val = !emailNotifs;
                        setEmailNotifs(val);
                        showToastNotification(val ? 'Extrato por email ativado.' : 'Extrato por email desativado.');
                      }}
                    />
                    <span style={styles.toggleSlider}></span>
                  </label>
                </div>
              </div>
            </div>

            {/* SESSÕES ATIVAS */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Sessões e Dispositivos Autorizados</h3>
              <p style={styles.cardDesc}>Dispositivos atualmente ligados à sua conta SkyBank.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                <div style={styles.sessionBox}>
                  <div style={styles.sessionIcon}>💻</div>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '12px', color: '#ffffff' }}>Navegador Web (Chrome / Linux)</strong>
                    <span style={{ fontSize: '11px', color: '#10b981', display: 'block' }}>Sessão Atual • Luanda, Angola</span>
                  </div>
                  <span style={styles.activePill}>Ativo Agora</span>
                </div>

                <div style={styles.sessionBox}>
                  <div style={styles.sessionIcon}>📱</div>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '12px', color: '#ffffff' }}>SkyBank Mobile (iPhone 15 Pro)</strong>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Último acesso: Ontem às 21:14</span>
                  </div>
                  <button
                    onClick={() => showToastNotification('Sessão remota encerrada.')}
                    style={styles.btnDisconnect}
                  >
                    Encerrar
                  </button>
                </div>
              </div>

              <button
                onClick={() => showToastNotification('Todas as outras sessões foram encerradas com segurança.')}
                style={{ ...styles.btnSecondary, width: '100%', marginTop: '16px' }}
              >
                Encerrar Todas as Outras Sessões
              </button>
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
  heroCard: {
    backgroundColor: '#071022',
    border: '1px solid rgba(20, 120, 178, 0.25)',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  heroLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  avatarCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#0a152e',
    border: '2px solid #0070f3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  userName: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#ffffff',
    margin: 0,
  },
  statusVerified: {
    fontSize: '11px',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#10b981',
    padding: '2px 8px',
    borderRadius: '8px',
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: '12px',
    color: '#94a3b8',
    margin: '4px 0 8px 0',
  },
  metaRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  accountNumberBadge: {
    fontSize: '11px',
    fontFamily: 'monospace',
    backgroundColor: '#0a152e',
    color: '#cbd5e1',
    padding: '3px 8px',
    borderRadius: '6px',
    border: '1px solid rgba(20, 120, 178, 0.2)',
  },
  tierBadge: {
    fontSize: '11px',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    color: '#f59e0b',
    padding: '3px 8px',
    borderRadius: '6px',
    fontWeight: 'bold',
  },
  dateBadge: {
    fontSize: '11px',
    color: '#64748b',
    padding: '3px 8px',
  },
  heroRight: {
    display: 'flex',
    gap: '10px',
  },
  heroActionBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(20, 120, 178, 0.3)',
    color: '#cbd5e1',
    borderRadius: '8px',
    padding: '8px 14px',
    fontSize: '12px',
    cursor: 'pointer',
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
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  splitGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '18px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  inputField: {
    backgroundColor: '#0a152e',
    border: '1px solid rgba(20, 120, 178, 0.25)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#ffffff',
    fontSize: '13px',
    boxSizing: 'border-box',
  },
  selectField: {
    backgroundColor: '#0a152e',
    border: '1px solid rgba(20, 120, 178, 0.25)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: '#ffffff',
    fontSize: '13px',
    boxSizing: 'border-box',
  },
  inputTip: {
    fontSize: '10px',
    color: '#64748b',
  },
  btnPrimary: {
    backgroundColor: '#0070f3',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'center',
  },
  btnSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    color: '#cbd5e1',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '12px',
    cursor: 'pointer',
    textAlign: 'center',
  },
  toggleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  /* TIERS */
  tiersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  tierCard: {
    backgroundColor: '#071022',
    border: '1px solid rgba(20, 120, 178, 0.2)',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  tierFeaturesList: {
    paddingLeft: 0,
    listStyle: 'none',
    margin: '16px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  },
  tierFeatureItem: {
    fontSize: '12px',
    color: '#cbd5e1',
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
    lineHeight: '1.4',
  },
  btnTierAction: {
    borderRadius: '8px',
    border: 'none',
    padding: '10px',
    fontSize: '12px',
    fontWeight: 'bold',
    width: '100%',
    textAlign: 'center',
  },
  rangeInput: {
    width: '100%',
    accentColor: '#0070f3',
  },
  /* SESSÕES */
  sessionBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#0a152e',
    border: '1px solid rgba(20, 120, 178, 0.15)',
    borderRadius: '8px',
    padding: '12px',
  },
  sessionIcon: {
    fontSize: '20px',
  },
  activePill: {
    fontSize: '10px',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#10b981',
    padding: '3px 8px',
    borderRadius: '10px',
    fontWeight: 'bold',
  },
  btnDisconnect: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: '11px',
    cursor: 'pointer',
  },
};
