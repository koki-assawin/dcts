// ===========================
// DCTS - Date Utility
// ===========================
// ปัญหา: Google Sheets เก็บวันที่เป็น พ.ศ. (2569) แต่ JavaScript ตีความเป็น ค.ศ.
// th-TH locale จะบวก 543 อีกครั้ง ทำให้ได้ 3112
// แก้: แปลง BE→CE ก่อน แล้ว th-TH locale จะแสดงเป็น พ.ศ. ถูกต้อง

const DateUtils = {

  // "2569-03-10" (BE) → "2026-03-10" (CE)
  // "2026-03-10" (CE) → "2026-03-10" (ไม่เปลี่ยน)
  toISO(dateStr) {
    if (!dateStr) return '';
    const m = dateStr.toString().match(/^(\d{4})([-\/].+)$/);
    if (m && parseInt(m[1]) > 2400) return String(parseInt(m[1]) - 543) + m[2];
    return dateStr;
  },

  // "2026-03-10" (CE) → "2569-03-10" (BE) สำหรับส่ง GAS API
  toBE(dateStr) {
    if (!dateStr) return '';
    const m = dateStr.toString().match(/^(\d{4})([-\/].+)$/);
    if (m && parseInt(m[1]) <= 2400) return String(parseInt(m[1]) + 543) + m[2];
    return dateStr;
  },

  // แสดงผลเป็น "10 มี.ค. 2569" (th-TH พ.ศ.)
  formatThai(dateStr) {
    if (!dateStr) return '-';
    try {
      const d = new Date(this.toISO(dateStr) + 'T00:00:00');
      return d.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return dateStr; }
  },

  // แสดงผลเป็น "10 มีนาคม 2569" (ฉบับยาว)
  formatThaiLong(dateStr) {
    if (!dateStr) return '-';
    try {
      const d = new Date(this.toISO(dateStr) + 'T00:00:00');
      return d.toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch { return dateStr; }
  },
};
