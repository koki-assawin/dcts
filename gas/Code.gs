// ===========================
// DCTS - Disease Case Tracking System
// Google Apps Script Backend
// ===========================

const SPREADSHEET_ID = '1msdw5QoF-Mzios5msR2bS-aHmPvInU35mP_4zAcv6Lg';
const MAIN_SHEET = 'ชีต1';
const USERS_SHEET = 'Users';
const CONFIG_SHEET = 'Config';

const COL = {
  DATE: 0, CASE_NO: 1, ANIMAL: 2, SAMPLE: 3, PROVINCE: 4,
  GROSS_LESION: 5, LIMS_LINK: 6, EPI_REQUEST: 7, SSCS_RESULT: 8,
  BACTERIA: 9, VIRUS_RESULT: 10, VIRUS_DETAIL: 11, PARASITE: 12,
  CONCLUSION: 13, HISTO_RESULT: 14, FINAL_CAUSE: 15,
};

const ROLE_COLUMNS = {
  epi:       [COL.DATE, COL.CASE_NO, COL.ANIMAL, COL.SAMPLE, COL.PROVINCE, COL.EPI_REQUEST, COL.SSCS_RESULT],
  patho1:    [COL.GROSS_LESION, COL.LIMS_LINK],
  bacteria:  [COL.BACTERIA],
  virology:  [COL.VIRUS_RESULT, COL.VIRUS_DETAIL],
  parasite:  [COL.PARASITE],
  patho2:    [COL.CONCLUSION, COL.HISTO_RESULT, COL.FINAL_CAUSE],
  dashboard: [],
};

function doGet(e) { return handleRequest(e); }
function doPost(e) { return handleRequest(e); }

function handleRequest(e) {
  try {
    const action = e.parameter.action;
    let result;
    switch (action) {
      case 'login':        result = loginUser(e.parameter.role, e.parameter.password); break;
      case 'getCases':     result = getCases(e.parameter.startDate, e.parameter.endDate, e.parameter.caseNo); break;
      case 'getCase':      result = getCaseByNo(e.parameter.caseNo); break;
      case 'updateCase':   result = updateCase(JSON.parse(e.postData.contents)); break;
      case 'addCase':      result = addCase(JSON.parse(e.postData.contents)); break;
      case 'getDashboard': result = getDashboardData(e.parameter.startDate, e.parameter.endDate); break;
      case 'getConfig':    result = getConfig(); break;
      default:             result = { success: false, error: 'Unknown action' };
    }
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function loginUser(role, password) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(USERS_SHEET);
    if (!sheet) { createDefaultUsers(ss); sheet = ss.getSheetByName(USERS_SHEET); }
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toString() === role && data[i][1].toString() === password) {
        return { success: true, role: data[i][0], displayName: data[i][2] };
      }
    }
    return { success: false, error: 'รหัสผ่านไม่ถูกต้อง' };
  } catch (err) { return { success: false, error: err.toString() }; }
}

function createDefaultUsers(ss) {
  const sheet = ss.insertSheet(USERS_SHEET);
  sheet.getRange('A1:C1').setValues([['role', 'password', 'displayName']]);
  sheet.getRange('A2:C8').setValues([
    ['epi',      '1234', 'แผนกระบาดวิทยา'],
    ['patho1',   '1234', 'พยาธิวิทยา (ผ่าซาก)'],
    ['bacteria', '1234', 'แผนกแบคทีเรียวิทยา'],
    ['virology', '1234', 'แผนกไวรัสวิทยา'],
    ['parasite', '1234', 'แผนกปรสิตวิทยา'],
    ['patho2',   '1234', 'พยาธิวิทยา (สรุป)'],
    ['dashboard','1234', 'ผู้บริหาร / Dashboard'],
  ]);
}

function getCases(startDate, endDate, caseNo) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(MAIN_SHEET);
  const data = sheet.getDataRange().getValues();
  const results = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[COL.CASE_NO]) continue;
    if (caseNo && !row[COL.CASE_NO].toString().toLowerCase().includes(caseNo.toLowerCase())) continue;
    if (startDate || endDate) {
      const rowDate = parseDate(row[COL.DATE]);
      if (!rowDate) continue;
      if (startDate && rowDate < new Date(startDate)) continue;
      if (endDate && rowDate > new Date(endDate + 'T23:59:59')) continue;
    }
    results.push(rowToObject(row, i + 1));
  }
  return { success: true, cases: results, total: results.length };
}

function getCaseByNo(caseNo) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(MAIN_SHEET);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][COL.CASE_NO].toString() === caseNo.toString()) {
      return { success: true, case: rowToObject(data[i], i + 1) };
    }
  }
  return { success: false, error: 'ไม่พบเคส: ' + caseNo };
}

function updateCase(payload) {
  const { caseNo, role, data } = payload;
  if (!ROLE_COLUMNS[role]) return { success: false, error: 'Invalid role' };
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(MAIN_SHEET);
  const sheetData = sheet.getDataRange().getValues();
  let rowIndex = -1;
  for (let i = 1; i < sheetData.length; i++) {
    if (sheetData[i][COL.CASE_NO].toString() === caseNo.toString()) { rowIndex = i + 1; break; }
  }
  if (rowIndex === -1) return { success: false, error: 'ไม่พบเคส' };
  const allowedCols = ROLE_COLUMNS[role];
  const fieldMap = { 0:'date',1:'caseNo',2:'animal',3:'sample',4:'province',5:'grossLesion',6:'limsLink',7:'epiRequest',8:'sscsResult',9:'bacteria',10:'virusResult',11:'virusDetail',12:'parasite',13:'conclusion',14:'histoResult',15:'finalCause' };
  for (const col of allowedCols) {
    const fieldName = fieldMap[col];
    if (fieldName in data && data[fieldName] !== undefined) {
      sheet.getRange(rowIndex, col + 1).setValue(data[fieldName]);
    }
  }
  return { success: true, message: 'บันทึกข้อมูลสำเร็จ' };
}

function addCase(payload) {
  const { role, data } = payload;
  if (role !== 'epi') return { success: false, error: 'เฉพาะแผนกระบาดวิทยาเท่านั้น' };
  const existing = getCaseByNo(data.caseNo);
  if (existing.success) return { success: false, error: 'Case No. ' + data.caseNo + ' มีอยู่แล้ว' };
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(MAIN_SHEET);
  const newRow = new Array(16).fill('');
  newRow[COL.DATE] = data.date || '';
  newRow[COL.CASE_NO] = data.caseNo || '';
  newRow[COL.ANIMAL] = data.animal || '';
  newRow[COL.SAMPLE] = data.sample || '';
  newRow[COL.PROVINCE] = data.province || '';
  newRow[COL.EPI_REQUEST] = data.epiRequest || '';
  newRow[COL.SSCS_RESULT] = data.sscsResult || '';
  sheet.appendRow(newRow);
  return { success: true, message: 'เพิ่มเคสใหม่สำเร็จ' };
}

function getDashboardData(startDate, endDate) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(MAIN_SHEET);
  const data = sheet.getDataRange().getValues();
  const stats = { total:0, concluded:0, notConcluded:0, pending:0, animals:{}, provinces:{}, samples:{}, diseases:{}, monthly:{} };
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[COL.CASE_NO]) continue;
    if (startDate || endDate) {
      const rowDate = parseDate(row[COL.DATE]);
      if (!rowDate) continue;
      if (startDate && rowDate < new Date(startDate)) continue;
      if (endDate && rowDate > new Date(endDate + 'T23:59:59')) continue;
    }
    stats.total++;
    const conclusion = row[COL.CONCLUSION].toString().trim();
    if (conclusion.includes('ได้') && !conclusion.includes('ไม่ได้')) stats.concluded++;
    else if (conclusion.includes('ไม่ได้')) stats.notConcluded++;
    else stats.pending++;
    const animal = row[COL.ANIMAL] || 'ไม่ระบุ';
    stats.animals[animal] = (stats.animals[animal] || 0) + 1;
    const province = row[COL.PROVINCE] || 'ไม่ระบุ';
    stats.provinces[province] = (stats.provinces[province] || 0) + 1;
    const sample = row[COL.SAMPLE] || 'ไม่ระบุ';
    stats.samples[sample] = (stats.samples[sample] || 0) + 1;
    const cause = [row[COL.FINAL_CAUSE], row[COL.BACTERIA], row[COL.VIRUS_RESULT]].filter(Boolean).join(', ');
    if (cause.trim()) {
      cause.split(/[,;\/\n]+/).map(d => d.trim()).filter(d => d && d !== 'ไม่พบ' && d.toLowerCase() !== 'negative' && d !== '-').forEach(d => {
        stats.diseases[d] = (stats.diseases[d] || 0) + 1;
      });
    }
    const rowDate = parseDate(row[COL.DATE]);
    if (rowDate) {
      const mk = `${rowDate.getFullYear()}-${String(rowDate.getMonth()+1).padStart(2,'0')}`;
      stats.monthly[mk] = (stats.monthly[mk] || 0) + 1;
    }
  }
  const sort = obj => Object.entries(obj).sort(([,a],[,b])=>b-a).map(([name,count])=>({name,count}));
  return {
    success: true,
    summary: { total:stats.total, concluded:stats.concluded, notConcluded:stats.notConcluded, pending:stats.pending },
    animals: sort(stats.animals),
    provinces: sort(stats.provinces),
    samples: sort(stats.samples),
    diseases: sort(stats.diseases).slice(0,15),
    monthly: Object.entries(stats.monthly).sort(([a],[b])=>a.localeCompare(b)).map(([month,count])=>({month,count})),
  };
}

function getConfig() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(CONFIG_SHEET);
  if (!sheet) sheet = createDefaultConfig(ss);
  const data = sheet.getDataRange().getValues();
  const config = {};
  for (let i = 1; i < data.length; i++) {
    const key = data[i][0]; const value = data[i][1];
    if (key) { if (!config[key]) config[key] = []; config[key].push(value); }
  }
  return { success: true, config };
}

function createDefaultConfig(ss) {
  const sheet = ss.insertSheet(CONFIG_SHEET);
  sheet.getRange('A1:B1').setValues([['key','value']]);
  const d = [
    ['animal','โค'],['animal','กระบือ'],['animal','กวาง'],['animal','ไก่'],['animal','แพะ'],['animal','หมู'],
    ['animal','แกะ'],['animal','ม้า'],['animal','สุนัข'],['animal','แมว'],['animal','นก'],['animal','กระต่าย'],['animal','อื่นๆ'],
    ['sample','ซาก'],['sample','อวัยวะ'],['sample','เลือด'],['sample','ซีรัม'],['sample','สวอบ'],['sample','น้ำเหลือง'],['sample','อุจจาระ'],['sample','อื่นๆ'],
    ['conclusion','สรุปได้'],['conclusion','สรุปไม่ได้'],['conclusion','รอผล'],
  ];
  sheet.getRange(2,1,d.length,2).setValues(d);
  return sheet;
}

function rowToObject(row, rowIndex) {
  return {
    rowIndex, date: formatDateDisplay(row[COL.DATE]), caseNo: row[COL.CASE_NO],
    animal: row[COL.ANIMAL], sample: row[COL.SAMPLE], province: row[COL.PROVINCE],
    grossLesion: row[COL.GROSS_LESION], limsLink: row[COL.LIMS_LINK],
    epiRequest: row[COL.EPI_REQUEST], sscsResult: row[COL.SSCS_RESULT],
    bacteria: row[COL.BACTERIA], virusResult: row[COL.VIRUS_RESULT],
    virusDetail: row[COL.VIRUS_DETAIL], parasite: row[COL.PARASITE],
    conclusion: row[COL.CONCLUSION], histoResult: row[COL.HISTO_RESULT], finalCause: row[COL.FINAL_CAUSE],
  };
}

function parseDate(val) {
  if (!val) return null;
  if (val instanceof Date) {
    const d = new Date(val);
    // ถ้า year > 2400 แสดงว่าเป็น พ.ศ. ที่ถูกเก็บเป็น CE → แปลงกลับ CE จริง
    if (d.getFullYear() > 2400) d.setFullYear(d.getFullYear() - 543);
    return d;
  }
  const d = new Date(val.toString().trim());
  if (!isNaN(d.getTime())) {
    if (d.getFullYear() > 2400) d.setFullYear(d.getFullYear() - 543);
    return d;
  }
  return null;
}

function formatDateDisplay(val) {
  const d = parseDate(val);
  if (!d) return val ? val.toString() : '';
  return d.toISOString().split('T')[0];
}
