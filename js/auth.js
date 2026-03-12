// ===========================
// DCTS - Authentication
// ===========================

const Auth = {
  KEY: 'dcts_user',

  login(role, displayName) {
    sessionStorage.setItem(this.KEY, JSON.stringify({
      role,
      displayName,
      loginTime: Date.now()
    }));
  },

  logout() {
    sessionStorage.removeItem(this.KEY);
    window.location.href = 'index.html';
  },

  getUser() {
    try {
      return JSON.parse(sessionStorage.getItem(this.KEY));
    } catch {
      return null;
    }
  },

  require(allowedRoles = null) {
    const user = this.getUser();
    if (!user) {
      window.location.href = 'index.html';
      return null;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      window.location.href = 'index.html';
      return null;
    }
    return user;
  },

  isAllowed(page) {
    const user = this.getUser();
    if (!user) return false;
    if (page === 'dashboard' && user.role === 'dashboard') return true;
    if (page === 'cases' && user.role !== 'dashboard') return true;
    return false;
  },

  getRoleInfo(role) {
    return CONFIG.ROLES[role] || null;
  },

  canEdit(field) {
    const user = this.getUser();
    if (!user) return false;
    const roleInfo = CONFIG.ROLES[user.role];
    if (!roleInfo) return false;
    return roleInfo.editCols.includes(field);
  }
};
