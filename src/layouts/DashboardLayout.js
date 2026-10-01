import React, { useState, useEffect } from 'react';
import Logo from '../assets/ChatGPT Image 23_09_2026, 16_32_15.png';
import { useBank } from '../contexts/BankContext';
import '../styles/SkyBankShared.css';

export default function DashboardLayout({ children, activeTab = 'Dashboard' }) {
  const {
    user,
    darkMode,
    setDarkMode,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    logoutUser,
    navigateTo,
    toast,
    showToastNotification,
  } = useBank();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      const dateStr = `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
      setCurrentTime(timeStr);
      setCurrentDate(dateStr);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const menuItems = [
    { name: 'Dashboard', screen: 'dashboard', icon: <HomeIcon /> },
    { name: 'Transferências', screen: 'transferencias', icon: <TransferIcon /> },
    { name: 'Empréstimos', screen: 'emprestimos', icon: <CoinsIcon /> },
    { name: 'Carteira', screen: 'carteira_modal', icon: <WalletIcon /> },
    { name: 'Pagamentos', screen: 'pagamentos_modal', icon: <CreditCardIcon /> },
    { name: 'Notificações', screen: 'notificacoes_modal', icon: <BellIcon />, badge: unreadCount },
    { name: 'Perfil', screen: 'perfil_modal', icon: <UserIcon /> },
  ];

  const handleNavClick = (item) => {
    setMobileMenuOpen(false);
    if (item.screen === 'notificacoes_modal') {
      setNotificationsOpen(true);
      return;
    }
    if (['dashboard', 'transferencias', 'emprestimos'].includes(item.screen)) {
      navigateTo(item.screen);
    } else {
      showToastNotification(`Módulo de ${item.name} integrado na sua conta SkyBank.`);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard?.writeText(text);
    showToastNotification(`${label} copiado com sucesso!`);
  };

  return (
    <div className={`sky-app-root ${darkMode ? 'dark-theme' : 'light-theme'}`} style={styles.container}>
      {/* OVERLAY PARA MOBILE */}
      {mobileMenuOpen && (
        <div
          className="sky-mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
          style={styles.mobileOverlay}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`sky-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}
        style={{
          ...styles.sidebar,
          ...(mobileMenuOpen ? styles.sidebarMobileOpen : {}),
        }}
      >
        <div>
          <div style={styles.sidebarHeader}>
            <div style={styles.logoBadge}>
              <img src={Logo} alt="Logo" style={styles.sidebarLogoImg} />
            </div>
            <h1 style={styles.sidebarLogoText}>
              SKY<span style={{ color: '#0070f3' }}>BANK</span>
            </h1>
            <p style={styles.sidebarSubtext}>O teu dinheiro. O teu controlo.</p>
          </div>

          <nav style={styles.navMenu}>
            {menuItems.map((item) => {
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item)}
                  style={{
                    ...styles.navItem,
                    ...(isActive ? styles.navItemActive : {}),
                  }}
                  className={`sky-nav-item ${isActive ? 'active' : ''}`}
                >
                  <span style={styles.navIcon}>{item.icon}</span>
                  <span style={styles.navLabel}>{item.name}</span>
                  {item.badge > 0 && <span style={styles.badge}>{item.badge}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        <div style={styles.sidebarFooter}>
          <div style={styles.darkModeRow}>
            <span style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🌙 Modo escuro
            </span>
            <label style={styles.switch}>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
              <span style={styles.slider}></span>
            </label>
          </div>

          <button
            onClick={logoutUser}
            style={styles.logoutBtn}
            className="sky-logout-btn"
          >
            <ExitIcon />
            <span>Terminar sessão</span>
          </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <div style={styles.mainWrapper}>
        {/* CABEÇALHO SUPERIOR */}
        <header style={styles.header} className="sky-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* BOTÃO HAMBURGUER PARA MOBILE/TABLET */}
            <button
              style={styles.hamburgerBtn}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sky-hamburger"
              aria-label="Abrir menu"
            >
              <MenuIcon />
            </button>

            <span style={{ fontSize: '26px' }}>👋</span>
            <div>
              <h1 style={styles.greetingTitle}>Olá, {user.shortName}!</h1>
              <p style={styles.greetingSubtitle}>Bem-vindo de volta ao SkyBank.</p>
            </div>
          </div>

          <div style={styles.headerRight} className="sky-header-right">
            <div style={styles.dateDisplay} className="sky-date-display">
              <span>{currentDate || 'Seg, 23 de Junho de 2025'}</span>
              <strong style={{ fontSize: '14px', color: '#ffffff', display: 'block', textAlign: 'right' }}>
                {currentTime || '19:42'}
              </strong>
            </div>

            {/* BOTÃO NOTIFICAÇÕES RÁPIDO */}
            <button
              onClick={() => setNotificationsOpen(true)}
              style={styles.headerBellBtn}
              className="sky-header-bell"
              title="Notificações"
            >
              <BellIcon />
              {unreadCount > 0 && <span style={styles.headerBellBadge}>{unreadCount}</span>}
            </button>

            {/* DROPDOWN DE USUÁRIO */}
            <div style={{ position: 'relative' }}>
              <div
                style={styles.userDropdown}
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="sky-user-dropdown"
              >
                <div style={styles.userAvatar}>
                  <UserIcon />
                </div>
                <div style={{ textAlign: 'left' }} className="sky-user-details">
                  <div style={styles.userName}>{user.name}</div>
                  <div style={styles.userAccount}>
                    Conta: {user.accountNumber} <span style={styles.checkIcon}>✓</span>
                  </div>
                </div>
                <span style={{ color: '#64748b', fontSize: '12px', marginLeft: '6px' }}>
                  {userDropdownOpen ? '▲' : '▼'}
                </span>
              </div>

              {/* MENU SUSPENSO DO USUÁRIO */}
              {userDropdownOpen && (
                <div style={styles.dropdownMenu} className="sky-dropdown-menu">
                  <div style={styles.dropdownHeader}>
                    <div style={{ fontWeight: '600', color: '#ffffff', fontSize: '13px' }}>{user.name}</div>
                    <div style={{ fontSize: '11px', color: '#0070f3' }}>Nível {user.tier} {user.tierIcon}</div>
                  </div>

                  <div
                    style={styles.dropdownItem}
                    onClick={() => {
                      copyToClipboard(user.accountNumber, 'Número de conta');
                      setUserDropdownOpen(false);
                    }}
                  >
                    <span>Copiar Conta: {user.accountNumber}</span>
                  </div>

                  <div
                    style={styles.dropdownItem}
                    onClick={() => {
                      copyToClipboard(user.iban, 'IBAN');
                      setUserDropdownOpen(false);
                    }}
                  >
                    <span>Copiar IBAN</span>
                  </div>

                  <div
                    style={styles.dropdownItem}
                    onClick={() => {
                      navigateTo('transferencias');
                      setUserDropdownOpen(false);
                    }}
                  >
                    <span>Transferências</span>
                  </div>

                  <div
                    style={styles.dropdownItem}
                    onClick={() => {
                      navigateTo('emprestimos');
                      setUserDropdownOpen(false);
                    }}
                  >
                    <span>Empréstimos</span>
                  </div>

                  <div style={styles.dropdownDivider} />

                  <div
                    style={{ ...styles.dropdownItem, color: '#ef4444' }}
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logoutUser();
                    }}
                  >
                    <span>Terminar Sessão</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ÁREA DE CONTEÚDO RENDERIZADA */}
        <main style={styles.mainContent} className="sky-main-content">
          {children}
        </main>
      </div>

      {/* MODAL DE NOTIFICAÇÕES */}
      {notificationsOpen && (
        <div style={styles.modalBackdrop} onClick={() => setNotificationsOpen(false)}>
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BellIcon />
                <h3 style={{ margin: 0, fontSize: '16px' }}>Notificações SkyBank</h3>
                {unreadCount > 0 && <span style={styles.badge}>{unreadCount} novas</span>}
              </div>
              <button
                onClick={() => setNotificationsOpen(false)}
                style={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 16px 8px 16px' }}>
              <button
                onClick={markAllNotificationsAsRead}
                style={styles.linkActionBtn}
              >
                Marcar todas como lidas
              </button>
            </div>

            <div style={styles.notificationsList}>
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationAsRead(notif.id)}
                  style={{
                    ...styles.notificationItem,
                    opacity: notif.read ? 0.7 : 1,
                    backgroundColor: notif.read ? '#071022' : 'rgba(0, 112, 243, 0.08)',
                  }}
                >
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
                    <div style={{ fontSize: '13px', fontWeight: notif.read ? 'normal' : '600', color: '#ffffff' }}>
                      {notif.title}
                    </div>
                    <div style={{ fontSize: '11px', color: notif.color, marginTop: '2px', fontWeight: '500' }}>
                      {notif.detail}
                    </div>
                  </div>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>{notif.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TOAST FLUTUANTE */}
      {toast && (
        <div style={styles.toastContainer} className="sky-toast">
          <div style={styles.toastBadge}>✓</div>
          <span style={{ fontSize: '13px', color: '#ffffff' }}>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

/* ÍCONES SVG */
const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
);
const WalletIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M16 12h.01" />
  </svg>
);
const TransferIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4" />
  </svg>
);
const CoinsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="8" cy="8" r="6" />
    <path d="M18 0a6 6 0 0 1 0 12" />
  </svg>
);
const CreditCardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="4" width="22" height="16" rx="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const ExitIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#040914',
    color: '#ffffff',
    boxSizing: 'border-box',
    position: 'relative',
    overflowX: 'hidden',
  },
  sidebar: {
    width: '210px',
    backgroundColor: '#060d1d',
    borderRight: '1px solid rgba(20, 120, 178, 0.15)',
    padding: '20px 12px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flexShrink: 0,
    zIndex: 100,
    transition: 'transform 0.3s ease',
  },
  sidebarMobileOpen: {
    transform: 'translateX(0)',
  },
  mobileOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(4px)',
    zIndex: 99,
  },
  sidebarHeader: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  logoBadge: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    margin: '0 auto 8px auto',
    background: 'radial-gradient(circle, #bf953f 0%, #000 70%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarLogoImg: {
    width: '50px',
  },
  sidebarLogoText: {
    fontSize: '20px',
    fontWeight: '800',
    margin: 0,
    letterSpacing: '1px',
  },
  sidebarSubtext: {
    fontSize: '10px',
    color: '#64748b',
    margin: '2px 0 0 0',
  },
  navMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    textAlign: 'left',
    width: '100%',
    transition: 'background 0.2s, color 0.2s',
  },
  navItemActive: {
    backgroundColor: '#0070f3',
    color: '#ffffff',
  },
  navIcon: {
    display: 'flex',
    alignItems: 'center',
  },
  navLabel: {
    flex: 1,
  },
  badge: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '10px',
    borderRadius: '10px',
    padding: '2px 6px',
    fontWeight: 'bold',
  },
  sidebarFooter: {
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  darkModeRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switch: {
    position: 'relative',
    display: 'inline-block',
    width: '34px',
    height: '18px',
  },
  slider: {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0070f3',
    borderRadius: '18px',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '6px',
    padding: '8px 10px',
    color: '#ef4444',
    fontSize: '12px',
    cursor: 'pointer',
    width: '100%',
    justifyContent: 'center',
  },
  mainWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflowX: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    borderBottom: '1px solid rgba(20, 120, 178, 0.1)',
    backgroundColor: '#040914',
  },
  hamburgerBtn: {
    display: 'none',
    background: 'none',
    border: '1px solid rgba(20, 120, 178, 0.3)',
    color: '#ffffff',
    borderRadius: '8px',
    padding: '6px',
    cursor: 'pointer',
  },
  greetingTitle: {
    fontSize: '20px',
    fontWeight: '700',
    margin: 0,
  },
  greetingSubtitle: {
    fontSize: '12px',
    color: '#64748b',
    margin: 0,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  dateDisplay: {
    fontSize: '11px',
    color: '#64748b',
  },
  headerBellBtn: {
    background: '#0a1224',
    border: '1px solid rgba(20, 120, 178, 0.2)',
    color: '#94a3b8',
    borderRadius: '8px',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
  },
  headerBellBadge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    fontSize: '9px',
    borderRadius: '10px',
    padding: '1px 5px',
    fontWeight: 'bold',
  },
  userDropdown: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#0a1224',
    border: '1px solid rgba(20, 120, 178, 0.2)',
    padding: '6px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  userAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: '12px',
    fontWeight: '600',
  },
  userAccount: {
    fontSize: '10px',
    color: '#64748b',
  },
  checkIcon: {
    color: '#0070f3',
    fontWeight: 'bold',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    backgroundColor: '#071022',
    border: '1px solid rgba(20, 120, 178, 0.3)',
    borderRadius: '8px',
    padding: '8px 0',
    minWidth: '220px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
    zIndex: 110,
  },
  dropdownHeader: {
    padding: '8px 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    marginBottom: '4px',
  },
  dropdownItem: {
    padding: '8px 16px',
    fontSize: '12px',
    color: '#cbd5e1',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  dropdownDivider: {
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    margin: '4px 0',
  },
  mainContent: {
    flex: 1,
    padding: '16px 24px',
    overflowY: 'auto',
  },
  /* MODAL */
  modalBackdrop: {
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
    zIndex: 200,
    padding: '16px',
  },
  modalBox: {
    backgroundColor: '#071022',
    border: '1px solid rgba(20, 120, 178, 0.3)',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '460px',
    maxHeight: '85vh',
    overflowY: 'auto',
    boxShadow: '0 20px 30px rgba(0, 0, 0, 0.5)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: '18px',
    cursor: 'pointer',
  },
  linkActionBtn: {
    background: 'none',
    border: 'none',
    color: '#0070f3',
    fontSize: '11px',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  notificationsList: {
    padding: '8px 16px 16px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  notificationItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid rgba(20, 120, 178, 0.15)',
    cursor: 'pointer',
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
  toastContainer: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    backgroundColor: '#0b162c',
    border: '1px solid #0070f3',
    boxShadow: '0 10px 25px rgba(0, 112, 243, 0.3)',
    padding: '12px 18px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    zIndex: 999,
    animation: 'slideUp 0.3s ease',
  },
  toastBadge: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    backgroundColor: '#10b981',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
  },
};
