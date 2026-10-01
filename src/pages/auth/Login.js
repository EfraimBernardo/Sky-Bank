import React, { useState } from 'react';
import Logo from '../../assets/ChatGPT Image 23_09_2026, 16_32_15.png';
import '../../styles/LoginCadaster.css';
import '../../styles/SkyBankShared.css';
import { useBank } from '../../contexts/BankContext';

export default function LoginScreen() {
  const { loginUser, registerUser } = useBank();

  const [isLogin, setIsLogin] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  // Estados dos formulários
  const [loginIdentifier, setLoginIdentifier] = useState('efraim@skybank.ao');
  const [loginPassword, setLoginPassword] = useState('123456');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    birthDate: '',
    gender: '',
    docType: 'Bilhete de Identidade',
    docNumber: '',
    docIssueDate: '',
    docExpiryDate: '',
    country: 'Angola',
    province: 'Luanda',
    municipality: '',
    neighborhood: '',
    password: '',
    confirmPassword: '',
    pin: '',
    confirmPin: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [newAccountDetails, setNewAccountDetails] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrorMessage('');
  };

  const handleLoginSubmit = (e) => {
    e?.preventDefault();
    if (!loginIdentifier.trim()) {
      setErrorMessage('Por favor, introduza o seu nome, email ou número de conta.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Por favor, introduza a sua palavra-passe.');
      return;
    }
    // Login com sucesso
    loginUser(loginIdentifier, loginPassword);
  };

  const handleNextStep = () => {
    setErrorMessage('');
    if (currentStep === 1) {
      if (!formData.fullName.trim()) {
        setErrorMessage('Por favor, introduza o seu nome completo.');
        return;
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        setErrorMessage('Por favor, introduza um email válido.');
        return;
      }
      if (!formData.phone.trim()) {
        setErrorMessage('Por favor, introduza o seu número de telefone.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!formData.docNumber.trim()) {
        setErrorMessage('Por favor, introduza o número do documento de identificação.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!formData.municipality.trim()) {
        setErrorMessage('Por favor, introduza o seu município.');
        return;
      }
      setCurrentStep(4);
    }
  };

  const handleRegisterSubmit = (e) => {
    e?.preventDefault();
    setErrorMessage('');

    if (!formData.password || formData.password.length < 4) {
      setErrorMessage('A palavra-passe deve ter no mínimo 4 caracteres.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('As palavras-passe não coincidem.');
      return;
    }
    if (!formData.pin || formData.pin.length !== 4) {
      setErrorMessage('O PIN da carteira deve ter exatamente 4 números.');
      return;
    }
    if (formData.pin !== formData.confirmPin) {
      setErrorMessage('Os PINs da carteira não coincidem.');
      return;
    }

    // Criar conta simulada
    const generatedAccount = `SB-0000${Math.floor(2000 + Math.random() * 7000)}`;
    const generatedIban = `AO06.0000.${Math.floor(1000 + Math.random() * 9000)}.0000.5421.1`;

    setNewAccountDetails({
      name: formData.fullName,
      account: generatedAccount,
      iban: generatedIban,
      bonus: '50.000,00 Kz',
    });

    setRegistrationSuccess(true);
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSuccess(true);
  };

  return (
    <div style={styles.container} className="sky-auth-container">
      {/* LADO ESQUERDO: INFORMAÇÕES E LOGO (FIXO/RESPONSIVO) */}
      <div style={styles.leftSide} className="leftSide sky-auth-left">
        <div style={styles.logoContainer}>
          <div>
            <img src={Logo} alt="Logo SkyBank" style={styles.logoImg} />
          </div>
          <br />
          <h1 style={styles.logoText}>
            SKY<span style={{ color: '#0070f3' }}>BANK</span>
          </h1>
        </div>
        <br />
        <br />
        <div style={styles.heroTextContainer}>
          <h2 style={styles.mainHeading}>
            O teu dinheiro.<br />
            <span style={{ color: '#0070f3' }}>O teu controlo.</span>
          </h2>
          <p style={styles.description}>
            Tenha uma experiência financeira simples, segura e inteligente.
          </p>
          <p style={styles.subDescription}>
            No SkyBank, podes gerir a tua carteira, realizar transferências,
            acompanhar os teus movimentos e solicitar empréstimos — tudo num único lugar.
          </p>
        </div>
        <br />
        <br />

        <div className="pillarsContainer" style={styles.pillarsContainer}>
          <div className="pillarItem" style={styles.pillarItem}>
            <span className="pillarIcon">🛡️</span> Simples.
          </div>
          <div className="pillarItem" style={styles.pillarItem}>
            <span className="pillarIcon">🔒</span> Seguro.
          </div>
          <div className="pillarItem" style={styles.pillarItem}>
            <span className="pillarIcon">⚡</span> Digital.
          </div>
        </div>
      </div>

      {/* LADO DIREITO: CARD DE LOGIN E CADASTRO */}
      <div style={styles.rightSide} className="sky-auth-right">
        <div style={styles.card} className="sky-auth-card">
          {/* Cabeçalho Único */}
          <div style={styles.cardHeader}>
            <div style={styles.headerLogoGroup}>
              <img src={Logo} alt="Logo" style={styles.cardLogoImg} />
              <span style={styles.cardLogoText}>
                SKY<span style={{ color: '#0070f3' }}>BANK</span>
              </span>
            </div>

            <div style={styles.fintechBadge}>
              <span style={{ color: '#10b981', fontSize: '10px' }}>●</span>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Fintech Segura</span>
            </div>
          </div>

          {/* MENSAGEM DE ERRO/ALERTA */}
          {errorMessage && (
            <div style={styles.errorAlert}>
              <span style={{ fontSize: '14px' }}>⚠️</span>
              <span style={{ fontSize: '12px', color: '#ef4444' }}>{errorMessage}</span>
            </div>
          )}

          {registrationSuccess ? (
            /* FEEDBACK DE CONTA CRIADA COM SUCESSO */
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={styles.successIconCircle}>🎉</div>
              <h3 style={{ ...styles.cardTitle, color: '#10b981', margin: '14px 0 6px 0' }}>
                Conta criada com sucesso!
              </h3>
              <p style={{ ...styles.cardSubtitle, margin: '0 0 20px 0' }}>
                Bem-vindo ao SkyBank, <strong>{newAccountDetails?.name}</strong>. A tua conta digital está ativa e pronta para uso!
              </p>

              <div style={styles.accountCreatedBox}>
                <div style={styles.createdRow}>
                  <span style={styles.createdLabel}>Número de Conta:</span>
                  <strong style={styles.createdValue}>{newAccountDetails?.account}</strong>
                </div>
                <div style={styles.createdRow}>
                  <span style={styles.createdLabel}>IBAN Provisório:</span>
                  <strong style={{ ...styles.createdValue, fontSize: '12px' }}>{newAccountDetails?.iban}</strong>
                </div>
                <div style={styles.createdRow}>
                  <span style={styles.createdLabel}>Bónus Inicial de Boas-Vindas:</span>
                  <strong style={{ ...styles.createdValue, color: '#10b981' }}>{newAccountDetails?.bonus}</strong>
                </div>
              </div>

              <button
                type="button"
                style={{ ...styles.btnPrimary, width: '100%', marginTop: '20px' }}
                onClick={() => {
                  registerUser(formData);
                }}
              >
                Aceder à Minha Carteira →
              </button>
            </div>
          ) : isLogin ? (
            /* ------------------- FORMULÁRIO DE LOGIN ------------------- */
            <>
              <h3 style={styles.cardTitle}>Bem-vindo de volta</h3>
              <p style={styles.cardSubtitle}>Entre na sua conta SkyBank</p>

              <form onSubmit={handleLoginSubmit} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Nome, Email ou Nº da conta</label>
                  <input
                    type="text"
                    placeholder="Ex: joao@email.com ou 923 456 789"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Palavra-passe</label>
                  <div style={styles.passwordWrapper}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Digite a sua palavra-passe"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      style={styles.inputPassword}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                      title={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                    >
                      {showPassword ? '🔒' : '👁️'}
                    </button>
                  </div>
                </div>

                <div style={styles.forgotPasswordRow}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(true);
                      setForgotSuccess(false);
                    }}
                    style={styles.forgotPasswordBtn}
                  >
                    Esqueci a palavra-passe?
                  </button>
                </div>

                <button type="submit" style={styles.btnPrimary}>
                  Entrar <span style={{ marginLeft: '8px' }}>→</span>
                </button>

                {/* ATALHO DEMO CONVENIENTE */}
                <button
                  type="button"
                  style={styles.demoLoginBtn}
                  onClick={() => {
                    loginUser('efraim@skybank.ao', '123456');
                  }}
                >
                  ⚡ Entrar como Efraim João (Demonstração)
                </button>

                <div style={styles.dividerRow}>
                  <div style={styles.dividerLine}></div>
                  <span style={styles.dividerText}>ou</span>
                  <div style={styles.dividerLine}></div>
                </div>

                <p style={styles.noAccountText}>Ainda não tens uma conta?</p>
                <button
                  type="button"
                  style={styles.btnSecondary}
                  onClick={() => {
                    setIsLogin(false);
                    setCurrentStep(1);
                    setErrorMessage('');
                  }}
                >
                  Criar conta
                </button>
              </form>
            </>
          ) : (
            /* ------------------- FORMULÁRIO DE CADASTRO ------------------- */
            <>
              <h3 style={styles.cardTitle}>Criar conta</h3>
              <p style={styles.cardSubtitle}>Vamos começar! Completa as 4 etapas para criar a tua conta.</p>

              {/* Indicador de Passos / Stepper */}
              <div style={styles.stepperContainer}>
                <div style={styles.stepperLine}></div>

                <div style={styles.stepItem} onClick={() => currentStep > 1 && setCurrentStep(1)}>
                  <div style={{ ...styles.stepNumber, ...(currentStep >= 1 ? styles.stepNumberActive : {}) }}>1</div>
                  <span
                    className="sky-stepper-label"
                    style={{ ...styles.stepLabel, ...(currentStep >= 1 ? styles.stepLabelActive : {}) }}
                  >
                    Dados pessoais
                  </span>
                </div>

                <div style={styles.stepItem} onClick={() => currentStep > 2 && setCurrentStep(2)}>
                  <div style={{ ...styles.stepNumber, ...(currentStep >= 2 ? styles.stepNumberActive : {}) }}>2</div>
                  <span
                    className="sky-stepper-label"
                    style={{ ...styles.stepLabel, ...(currentStep >= 2 ? styles.stepLabelActive : {}) }}
                  >
                    Identificação
                  </span>
                </div>

                <div style={styles.stepItem} onClick={() => currentStep > 3 && setCurrentStep(3)}>
                  <div style={{ ...styles.stepNumber, ...(currentStep >= 3 ? styles.stepNumberActive : {}) }}>3</div>
                  <span
                    className="sky-stepper-label"
                    style={{ ...styles.stepLabel, ...(currentStep >= 3 ? styles.stepLabelActive : {}) }}
                  >
                    Residência
                  </span>
                </div>

                <div style={styles.stepItem}>
                  <div style={{ ...styles.stepNumber, ...(currentStep >= 4 ? styles.stepNumberActive : {}) }}>4</div>
                  <span
                    className="sky-stepper-label"
                    style={{ ...styles.stepLabel, ...(currentStep >= 4 ? styles.stepLabelActive : {}) }}
                  >
                    Segurança
                  </span>
                </div>
              </div>

              {/* ETAPA 1: DADOS PESSOAIS */}
              {currentStep === 1 && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleNextStep();
                  }}
                  style={styles.form}
                >
                  <h4 style={styles.stepTitle}>1. Dados pessoais</h4>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Nome completo *</label>
                    <input
                      type="text"
                      placeholder="Ex.: João Manuel Bernardo"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.formRow} className="sky-form-row">
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Email *</label>
                      <input
                        type="email"
                        placeholder="exemplo@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        style={styles.input}
                        required
                      />
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Telefone *</label>
                      <input
                        type="tel"
                        placeholder="+244 923 456 789"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        style={styles.input}
                        required
                      />
                    </div>
                  </div>

                  <div style={styles.formRow} className="sky-form-row">
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Data de nascimento</label>
                      <input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => handleInputChange('birthDate', e.target.value)}
                        style={styles.input}
                      />
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Género</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        style={styles.selectInput}
                      >
                        <option value="" disabled hidden>
                          Selecione
                        </option>
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                        <option value="O">Outro</option>
                      </select>
                    </div>
                  </div>

                  <div style={styles.formActions}>
                    <button
                      type="button"
                      style={styles.btnSecondary}
                      onClick={() => {
                        setIsLogin(true);
                        setErrorMessage('');
                      }}
                    >
                      Cancelar
                    </button>

                    <button type="button" style={styles.btnPrimary} onClick={handleNextStep}>
                      Próximo <span style={{ marginLeft: '8px' }}>▶</span>
                    </button>
                  </div>
                </form>
              )}

              {/* ETAPA 2: IDENTIFICAÇÃO */}
              {currentStep === 2 && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleNextStep();
                  }}
                  style={styles.form}
                >
                  <h4 style={styles.stepTitle}>2. Identificação</h4>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Tipo de Documento</label>
                    <select
                      value={formData.docType}
                      onChange={(e) => handleInputChange('docType', e.target.value)}
                      style={styles.selectInput}
                    >
                      <option value="Bilhete de Identidade">Bilhete de Identidade (B.I.)</option>
                      <option value="Passaporte">Passaporte</option>
                      <option value="Cartão de Residente">Cartão de Residente</option>
                    </select>
                  </div>

                  <div style={styles.formRow} className="sky-form-row">
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Número do Documento *</label>
                      <input
                        type="text"
                        placeholder="Ex.: 00210034AB66"
                        value={formData.docNumber}
                        onChange={(e) => handleInputChange('docNumber', e.target.value)}
                        style={styles.input}
                        required
                      />
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Data de Emissão</label>
                      <input
                        type="date"
                        value={formData.docIssueDate}
                        onChange={(e) => handleInputChange('docIssueDate', e.target.value)}
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={styles.formRow} className="sky-form-row">
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Data de Validade</label>
                      <input
                        type="date"
                        value={formData.docExpiryDate}
                        onChange={(e) => handleInputChange('docExpiryDate', e.target.value)}
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={styles.formActions}>
                    <button
                      type="button"
                      style={styles.btnSecondary}
                      onClick={() => {
                        setCurrentStep(1);
                        setErrorMessage('');
                      }}
                    >
                      <span style={{ marginRight: '8px' }}>◀</span> Anterior
                    </button>

                    <button type="button" style={styles.btnPrimary} onClick={handleNextStep}>
                      Próximo <span style={{ marginLeft: '8px' }}>▶</span>
                    </button>
                  </div>
                </form>
              )}

              {/* ETAPA 3: LOCALIZAÇÃO */}
              {currentStep === 3 && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleNextStep();
                  }}
                  style={styles.form}
                >
                  <h4 style={styles.stepTitle}>3. Residência e Localização</h4>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>País</label>
                    <input
                      type="text"
                      placeholder="Ex: Angola"
                      value={formData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formRow} className="sky-form-row">
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Província</label>
                      <input
                        type="text"
                        placeholder="Ex: Luanda"
                        value={formData.province}
                        onChange={(e) => handleInputChange('province', e.target.value)}
                        style={styles.input}
                      />
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Município *</label>
                      <input
                        type="text"
                        placeholder="Ex: Talatona"
                        value={formData.municipality}
                        onChange={(e) => handleInputChange('municipality', e.target.value)}
                        style={styles.input}
                        required
                      />
                    </div>
                  </div>

                  <div style={styles.formRow} className="sky-form-row">
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Bairro / Zona</label>
                      <input
                        type="text"
                        placeholder="Ex: Benfica"
                        value={formData.neighborhood}
                        onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                        style={styles.input}
                      />
                    </div>
                  </div>

                  <div style={styles.formActions}>
                    <button
                      type="button"
                      style={styles.btnSecondary}
                      onClick={() => {
                        setCurrentStep(2);
                        setErrorMessage('');
                      }}
                    >
                      <span style={{ marginRight: '8px' }}>◀</span> Anterior
                    </button>

                    <button type="button" style={styles.btnPrimary} onClick={handleNextStep}>
                      Próximo <span style={{ marginLeft: '8px' }}>▶</span>
                    </button>
                  </div>
                </form>
              )}

              {/* ETAPA 4: SEGURANÇA */}
              {currentStep === 4 && (
                <form onSubmit={handleRegisterSubmit} style={styles.form}>
                  <h4 style={styles.stepTitle}>4. Segurança da Conta</h4>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Palavra-Passe (no mínimo 4 caracteres) *</label>
                    <div style={styles.passwordWrapper}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Crie a sua palavra-passe"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        style={styles.inputPassword}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={styles.eyeButton}
                      >
                        {showPassword ? '🔒' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <div style={styles.formRow} className="sky-form-row">
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Confirmar Palavra-Passe *</label>
                      <div style={styles.passwordWrapper}>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Repita a palavra-passe"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          style={styles.inputPassword}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={styles.eyeButton}
                        >
                          {showConfirmPassword ? '🔒' : '👁️'}
                        </button>
                      </div>
                    </div>

                    <div style={styles.inputGroup}>
                      <label style={styles.label}>PIN da Carteira (4 números) *</label>
                      <div style={styles.passwordWrapper}>
                        <input
                          type={showPin ? 'text' : 'password'}
                          placeholder="Ex.: 1234"
                          maxLength={4}
                          value={formData.pin}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                            handleInputChange('pin', val);
                          }}
                          style={styles.inputPassword}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPin(!showPin)}
                          style={styles.eyeButton}
                        >
                          {showPin ? '🔒' : '👁️'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Confirmar PIN da Carteira *</label>
                    <div style={styles.passwordWrapper}>
                      <input
                        type={showConfirmPin ? 'text' : 'password'}
                        placeholder="Repita o seu PIN de 4 números"
                        maxLength={4}
                        value={formData.confirmPin}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                          handleInputChange('confirmPin', val);
                        }}
                        style={styles.inputPassword}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPin(!showConfirmPin)}
                        style={styles.eyeButton}
                      >
                        {showConfirmPin ? '🔒' : '👁️'}
                      </button>
                    </div>
                  </div>

                  <div style={styles.formActions}>
                    <button
                      type="button"
                      style={styles.btnSecondary}
                      onClick={() => {
                        setCurrentStep(3); // CORRIGIDO: Volta ao passo 3
                        setErrorMessage('');
                      }}
                    >
                      <span style={{ marginRight: '8px' }}>◀</span> Anterior
                    </button>

                    <button type="submit" style={styles.btnPrimary}>
                      Finalizar e Criar Conta <span style={{ marginLeft: '8px' }}>✓</span>
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODAL: RECUPERAÇÃO DE PALAVRA-PASSE */}
      {showForgotModal && (
        <div style={styles.modalOverlay} onClick={() => setShowForgotModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Recuperar Palavra-passe</h3>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                style={styles.modalCloseBtn}
              >
                ✕
              </button>
            </div>

            {forgotSuccess ? (
              <div style={{ padding: '16px 0', textAlign: 'center' }}>
                <span style={{ fontSize: '32px' }}>✉️</span>
                <h4 style={{ margin: '12px 0 6px 0', color: '#10b981' }}>Instruções Enviadas!</h4>
                <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.4' }}>
                  Enviámos um link e código de recuperação simulado para <strong>{forgotEmail}</strong>. Verifique a sua caixa de entrada.
                </p>
                <button
                  type="button"
                  style={{ ...styles.btnPrimary, width: '100%', marginTop: '14px' }}
                  onClick={() => setShowForgotModal(false)}
                >
                  Voltar ao Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                  Introduza o seu email ou número de conta associado ao SkyBank. Enviaremos um código para redefinir o seu acesso.
                </p>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Email ou Número de Conta</label>
                  <input
                    type="text"
                    placeholder="exemplo@email.com ou SB-00000001"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    style={styles.btnSecondary}
                    onClick={() => setShowForgotModal(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" style={styles.btnPrimary}>
                    Enviar Código →
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// OBJETO DE ESTILOS UNIFICADO (PRESERVANDO CORES E IDENTIDADE VISUAL EXATA)
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#0B1120',
    backgroundImage: 'linear-gradient(to right, #0B1120, #0c152b, #0f1b38)',
    color: '#ffffff',
    boxSizing: 'border-box',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '40px',
    padding: '20px',
  },
  leftSide: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '20px',
    maxWidth: '520px',
  },
  logoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '10px',
  },
  logoImg: {
    width: '240px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #bf953f, #fcf6ba, #b38728, #fbf5b7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
  },
  logoText: {
    fontSize: '48px',
    fontWeight: 'bold',
    margin: 0,
    letterSpacing: '1px',
  },
  heroTextContainer: {},
  mainHeading: {
    fontSize: '36px',
    fontWeight: 'bold',
    margin: '0 0 16px 0',
    lineHeight: '1.2',
  },
  description: {
    fontSize: '20px',
    color: '#94a3b8',
    lineHeight: '1.4',
    margin: '0 0 12px 0',
  },
  subDescription: {
    fontSize: '14px',
    color: '#64748b',
    lineHeight: '1.5',
    margin: 0,
  },
  pillarsContainer: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  pillarItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#94a3b8',
    border: 'solid 1px #1478b2',
    padding: '10px 18px',
    borderRadius: '50px',
    transition: 'all 0.3s ease',
    cursor: 'default',
  },
  rightSide: {
    flex: 1,
    display: 'flex',
    width: '100%',
    maxWidth: '560px',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    border: '2px solid #1478b2',
    backdropFilter: 'blur(12px)',
    borderRadius: '16px',
    padding: '32px 36px',
    boxSizing: 'border-box',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  headerLogoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  cardLogoImg: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
  },
  cardLogoText: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  fintechBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#0a1429',
    border: '1px solid rgba(20, 120, 178, 0.3)',
    padding: '4px 10px',
    borderRadius: '20px',
  },
  cardTitle: {
    fontSize: '22px',
    fontWeight: '600',
    margin: '0 0 6px 0',
  },
  cardSubtitle: {
    color: '#94a3b8',
    fontSize: '13px',
    margin: '0 0 20px 0',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    padding: '10px 14px',
    marginBottom: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formRow: {
    display: 'flex',
    gap: '14px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  },
  label: {
    fontSize: '12px',
    color: '#94a3b8',
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '11px 14px',
    color: '#ffffff',
    fontSize: '13px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  selectInput: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '11px 14px',
    color: '#ffffff',
    fontSize: '13px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    cursor: 'pointer',
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  inputPassword: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
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
  eyeButton: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '4px',
  },
  forgotPasswordRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: '-4px',
  },
  forgotPasswordBtn: {
    background: 'none',
    border: 'none',
    color: '#0070f3',
    fontSize: '12px',
    cursor: 'pointer',
    padding: 0,
    textDecoration: 'none',
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    transition: 'background-color 0.2s',
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  demoLoginBtn: {
    backgroundColor: 'rgba(0, 112, 243, 0.12)',
    border: '1px dashed #0070f3',
    color: '#38bdf8',
    borderRadius: '8px',
    padding: '10px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  formActions: {
    display: 'flex',
    gap: '14px',
    marginTop: '8px',
  },
  dividerRow: {
    display: 'flex',
    alignItems: 'center',
    margin: '4px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    padding: '0 10px',
    color: '#64748b',
    fontSize: '12px',
  },
  noAccountText: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#94a3b8',
    margin: '0 0 -4px 0',
  },
  stepTitle: {
    fontSize: '15px',
    fontWeight: '600',
    margin: '2px 0 8px 0',
    color: '#ffffff',
  },
  stepperContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    marginBottom: '22px',
    padding: '0 8px',
  },
  stepperLine: {
    position: 'absolute',
    top: '18px',
    left: '25px',
    right: '25px',
    height: '2px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 1,
  },
  stepItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    zIndex: 2,
    position: 'relative',
    cursor: 'pointer',
  },
  stepNumber: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    backgroundColor: '#0d192b',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '13px',
    transition: 'all 0.2s ease',
  },
  stepNumberActive: {
    backgroundColor: '#0070f3',
    color: '#ffffff',
    borderColor: '#0070f3',
    boxShadow: '0 0 12px rgba(0, 112, 243, 0.5)',
  },
  stepLabel: {
    fontSize: '11px',
    color: '#64748b',
  },
  stepLabelActive: {
    color: '#ffffff',
    fontWeight: '500',
  },
  successIconCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    border: '2px solid #10b981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    margin: '0 auto',
  },
  accountCreatedBox: {
    backgroundColor: '#071022',
    border: '1px solid rgba(20, 120, 178, 0.3)',
    borderRadius: '10px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    textAlign: 'left',
  },
  createdRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  createdLabel: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  createdValue: {
    fontSize: '13px',
    color: '#ffffff',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 300,
    padding: '16px',
  },
  modalContent: {
    backgroundColor: '#071022',
    border: '1px solid rgba(20, 120, 178, 0.3)',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '440px',
    padding: '20px',
    boxShadow: '0 20px 30px rgba(0, 0, 0, 0.6)',
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
};