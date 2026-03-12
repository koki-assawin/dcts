// ===========================
// DCTS - Date Utility + BE Date Picker
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

  // ============================================================
  // initBEPicker — Flatpickr ที่แสดงปี พ.ศ. ทุกจุด
  // ต้องโหลด Flatpickr CDN ก่อนใช้
  // คืนค่า Flatpickr instance (ใช้ fp.setDate / fp.clear)
  // ============================================================
  initBEPicker(inputEl, opts = {}) {
    if (!inputEl || !window.flatpickr) return null;

    // ทำให้ค่าปัจจุบันเป็น CE ก่อน
    if (inputEl.value) inputEl.value = DateUtils.toISO(inputEl.value);

    const M_LONG  = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
                     'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
    const M_SHORT = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.',
                     'ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    let fp;

    // overlay ปี พ.ศ. ทับ input ปี ค.ศ. ใน calendar header
    const patchYear = () => {
      if (!fp?.calendarContainer) return;
      const yearEl = fp.calendarContainer.querySelector('.cur-year');
      if (!yearEl) return;
      let ov = yearEl.parentElement.querySelector('.be-year-ov');
      if (!ov) {
        ov = document.createElement('span');
        ov.className = 'be-year-ov';
        ov.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;' +
          'justify-content:center;background:#fff;pointer-events:none;' +
          'font-weight:600;font-size:14px;z-index:2;';
        yearEl.parentElement.style.position = 'relative';
        yearEl.parentElement.appendChild(ov);
      }
      ov.textContent = fp.currentYear + 543;
    };

    // แสดงวันที่ใน field เป็น พ.ศ.
    const patchDisplay = (dates) => {
      if (!fp?.altInput || !dates?.[0]) return;
      const d = dates[0];
      fp.altInput.value = `${String(d.getDate()).padStart(2,'0')} ${M_LONG[d.getMonth()]} ${d.getFullYear() + 543}`;
    };

    fp = flatpickr(inputEl, {
      dateFormat : 'Y-m-d',
      altInput   : true,
      altFormat  : 'd M Y',
      allowInput : false,
      locale: {
        months   : { shorthand: M_SHORT, longhand: M_LONG },
        weekdays : { shorthand: ['อา','จ','อ','พ','พฤ','ศ','ส'],
                     longhand: ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัส','ศุกร์','เสาร์'] },
        firstDayOfWeek: 0,
      },
      ...opts,
      onReady      : (d,s,i) => { fp=i; patchDisplay(d); patchYear(); if(opts.onReady)       opts.onReady(d,s,i);       },
      onChange     : (d,s,i) => {       patchDisplay(d);              if(opts.onChange)      opts.onChange(d,s,i);      },
      onOpen       : (d,s,i) => { setTimeout(patchYear,20);           if(opts.onOpen)        opts.onOpen(d,s,i);        },
      onMonthChange: (d,s,i) => { setTimeout(patchYear,20);           if(opts.onMonthChange) opts.onMonthChange(d,s,i); },
      onYearChange : (d,s,i) => { setTimeout(patchYear,20);           if(opts.onYearChange)  opts.onYearChange(d,s,i);  },
    });

    if (fp.selectedDates.length) patchDisplay(fp.selectedDates);
    return fp;
  },
};
