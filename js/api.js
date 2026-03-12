// ===========================
// DCTS - API Layer
// ===========================

const API = {
  async call(action, params = {}, body = null) {
    if (!CONFIG.GAS_URL || CONFIG.GAS_URL === 'YOUR_GAS_DEPLOYMENT_URL') {
      throw new Error('กรุณาตั้งค่า GAS_URL ใน js/config.js ก่อนใช้งาน\nติดต่อผู้ดูแลระบบเพื่อรับ URL ของ Google Apps Script');
    }
    const url = new URL(CONFIG.GAS_URL);
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
    const options = {
      method: body ? 'POST' : 'GET',
      redirect: 'follow',
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    const res = await fetch(url.toString(), options);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();
    return data;
  },

  login: (role, password) =>
    API.call('login', { role, password }),

  getCases: (startDate, endDate, caseNo) =>
    API.call('getCases', { startDate, endDate, caseNo }),

  getCase: (caseNo) =>
    API.call('getCase', { caseNo }),

  updateCase: (caseNo, role, data) =>
    API.call('updateCase', {}, { caseNo, role, data }),

  addCase: (role, data) =>
    API.call('addCase', {}, { role, data }),

  getDashboard: (startDate, endDate) =>
    API.call('getDashboard', { startDate, endDate }),

  getConfig: () =>
    API.call('getConfig'),
};
