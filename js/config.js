// ===========================
// DCTS - Configuration
// ===========================

const CONFIG = {
  GAS_URL: 'https://script.google.com/macros/s/AKfycbxurqlx_jiIuLJNSmsG0edVWJiZjkxiIAD4b6-KcTtvqBtMtWLXTZXQWg36eFtVHX_YBg/exec',
  ROLES: {
    epi:       { label: 'ระบาดวิทยา',         color: '#3B82F6', bg: 'bg-blue-500',   light: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   editCols: ['date','caseNo','animal','sample','province','epiRequest','sscsResult'] },
    patho1:    { label: 'พยาธิวิทยา (ผ่าซาก)', color: '#10B981', bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', editCols: ['grossLesion','limsLink'] },
    bacteria:  { label: 'แบคทีเรียวิทยา',      color: '#F59E0B', bg: 'bg-amber-500',   light: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',  editCols: ['bacteria'] },
    virology:  { label: 'ไวรัสวิทยา',           color: '#8B5CF6', bg: 'bg-violet-500',  light: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200', editCols: ['virusResult','virusDetail'] },
    parasite:  { label: 'ปรสิตวิทยา',           color: '#EF4444', bg: 'bg-red-500',     light: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',    editCols: ['parasite'] },
    patho2:    { label: 'พยาธิวิทยา (สรุป)',    color: '#0EA5E9', bg: 'bg-sky-500',     light: 'bg-sky-50',     text: 'text-sky-700',     border: 'border-sky-200',    editCols: ['conclusion','histoResult','finalCause'] },
    dashboard: { label: 'Dashboard',             color: '#6366F1', bg: 'bg-indigo-500',  light: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200', editCols: [] },
  },
  FIELD_LABELS: {
    date:        'วันที่รับตัวอย่าง',
    caseNo:      'หมายเลขเคส (Case No.)',
    animal:      'ชนิดสัตว์',
    sample:      'ชนิดตัวอย่าง',
    province:    'จังหวัด / หน่วยงาน',
    epiRequest:  'Epidemiology Request',
    sscsResult:  'ผลจาก สสช.',
    grossLesion: 'บรรยายรอยโรค (ผ่าซาก)',
    limsLink:    'Link ภาพรอยโรค (LIMS)',
    bacteria:    'ผลการเพาะเชื้อแบคทีเรีย',
    virusResult: 'ผลการตรวจทางไวรัสวิทยา',
    virusDetail: 'รายละเอียดผลไวรัส',
    parasite:    'ผลการตรวจปรสิต',
    conclusion:  'สรุปผล (สรุปได้/ไม่ได้)',
    histoResult: 'ผลจุลพยาธิวิทยา',
    finalCause:  'สาเหตุโรคสรุปรวม',
  },
  ALL_FIELDS: ['date','caseNo','animal','sample','province','grossLesion','limsLink','epiRequest','sscsResult','bacteria','virusResult','virusDetail','parasite','conclusion','histoResult','finalCause'],
  FIELD_TYPES: {
    date:        'date',
    caseNo:      'text',
    animal:      'select-config-animal',
    sample:      'select-config-sample',
    province:    'text',
    epiRequest:  'textarea',
    sscsResult:  'textarea',
    grossLesion: 'textarea',
    limsLink:    'url',
    bacteria:    'textarea',
    virusResult: 'textarea',
    virusDetail: 'textarea',
    parasite:    'textarea',
    conclusion:  'select-config-conclusion',
    histoResult: 'textarea',
    finalCause:  'textarea',
  },
  SECTION_GROUPS: [
    {
      role: 'epi',
      label: 'ข้อมูลระบาดวิทยา',
      icon: '🔬',
      fields: ['date','caseNo','animal','sample','province','epiRequest','sscsResult']
    },
    {
      role: 'patho1',
      label: 'พยาธิวิทยา (ผ่าซาก)',
      icon: '🔍',
      fields: ['grossLesion','limsLink']
    },
    {
      role: 'bacteria',
      label: 'แบคทีเรียวิทยา',
      icon: '🧫',
      fields: ['bacteria']
    },
    {
      role: 'virology',
      label: 'ไวรัสวิทยา',
      icon: '🦠',
      fields: ['virusResult','virusDetail']
    },
    {
      role: 'parasite',
      label: 'ปรสิตวิทยา',
      icon: '🔭',
      fields: ['parasite']
    },
    {
      role: 'patho2',
      label: 'พยาธิวิทยา (สรุปผล)',
      icon: '📋',
      fields: ['conclusion','histoResult','finalCause']
    },
  ]
};
