# DCTS - ระบบติดตามผลการชันสูตรโรคสัตว์
## Disease Case Tracking System

---

## ภาพรวมระบบ

DCTS เป็นระบบบริหารจัดการผลการชันสูตรโรคสัตว์ โดยใช้ **Google Sheets** เป็นฐานข้อมูล และ **Google Apps Script** เป็น Backend API ข้อมูลทั้งหมดจัดเก็บใน Google Sheet ID: `1msdw5QoF-Mzios5msR2bS-aHmPvInU35mP_4zAcv6Lg`

---

## โครงสร้างไฟล์

```
dcts/
├── index.html          ← หน้า Login
├── case-list.html      ← รายการเคส + ค้นหา
├── case-form.html      ← แบบฟอร์มแก้ไขเคส
├── dashboard.html      ← Dashboard ผู้บริหาร
├── css/
│   └── style.css       ← Custom CSS (Sarabun font, animations)
├── js/
│   ├── config.js       ← ค่า Configuration และ Role settings
│   ├── api.js          ← API calls ไปยัง Google Apps Script
│   └── auth.js         ← Authentication (sessionStorage)
└── gas/
    └── Code.gs         ← Google Apps Script Backend
```

---

## ขั้นตอนการติดตั้ง

### ขั้นที่ 1: สร้าง Google Apps Script

1. เปิด [script.google.com](https://script.google.com)
2. คลิก **New project**
3. คัดลอกเนื้อหาจาก `gas/Code.gs` วางทับโค้ดเดิม
4. บันทึกโปรเจกต์ (Ctrl+S)

### ขั้นที่ 2: Deploy เป็น Web App

1. คลิกเมนู **Deploy** → **New deployment**
2. คลิกไอคอน ⚙️ ข้าง "Select type" → เลือก **Web app**
3. ตั้งค่าดังนี้:
   - **Description**: DCTS API
   - **Execute as**: Me
   - **Who has access**: Anyone
4. คลิก **Deploy**
5. **คัดลอก URL** ที่ได้ (จะมีรูปแบบ: `https://script.google.com/macros/s/XXXXX/exec`)

### ขั้นที่ 3: ตั้งค่า GAS_URL ในระบบ

เปิดไฟล์ `js/config.js` แก้บรรทัดที่ 5:

```javascript
// เปลี่ยนจาก:
GAS_URL: 'YOUR_GAS_DEPLOYMENT_URL',

// เป็น URL ที่ได้จาก Deploy:
GAS_URL: 'https://script.google.com/macros/s/AKfycb.../exec',
```

### ขั้นที่ 4: ตรวจสอบ Google Sheet

ตรวจสอบว่า Google Sheet มี:
- **Sheet "ชีต1"** - ข้อมูลเคส (Apps Script จะอ่าน/เขียนที่นี่)
- **Sheet "Users"** - จะถูกสร้างอัตโนมัติเมื่อ Login ครั้งแรก
- **Sheet "Config"** - จะถูกสร้างอัตโนมัติเมื่อใช้งานครั้งแรก

**Header Row (แถวที่ 1) ของ ชีต1 ควรมี:**
| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| วันที่รับตัวอย่าง | Case No. | ชนิดสัตว์ | ชนิดตัวอย่าง | จังหวัด/หน่วยงาน | บรรยายรอยโรค | Link ภาพ LIMS | Epi Request | ผลจาก สสช. | ผลแบคทีเรีย | ผลไวรัส | รายละเอียดไวรัส | ผลปรสิต | สรุปผล | ผลจุลพยาธิ | สาเหตุโรครวม |

### ขั้นที่ 5: เข้าใช้งาน

เปิดเบราว์เซอร์ไปที่: `http://localhost/dcts/` หรือ `http://localhost/dcts/index.html`

---

## ข้อมูล Login เริ่มต้น (Default)

| แผนก | Role | Password |
|------|------|----------|
| แผนกระบาดวิทยา | epi | 1234 |
| พยาธิวิทยา (ผ่าซาก) | patho1 | 1234 |
| แบคทีเรียวิทยา | bacteria | 1234 |
| ไวรัสวิทยา | virology | 1234 |
| ปรสิตวิทยา | parasite | 1234 |
| พยาธิวิทยา (สรุป) | patho2 | 1234 |
| Dashboard (ผู้บริหาร) | dashboard | 1234 |

> **หมายเหตุ:** รหัสผ่านเก็บใน Google Sheet (Sheet "Users") สามารถแก้ไขได้โดยตรง

---

## สิทธิ์การแก้ไขข้อมูลแต่ละ Role

| Role | ฟิลด์ที่แก้ไขได้ |
|------|----------------|
| epi | วันที่, Case No., ชนิดสัตว์, ชนิดตัวอย่าง, จังหวัด, Epi Request, ผลจาก สสช. |
| patho1 | บรรยายรอยโรค, Link ภาพ LIMS |
| bacteria | ผลแบคทีเรีย |
| virology | ผลไวรัส, รายละเอียดไวรัส |
| parasite | ผลปรสิต |
| patho2 | สรุปผล, ผลจุลพยาธิวิทยา, สาเหตุโรคสรุปรวม |
| dashboard | ดูอย่างเดียว (ไม่มีสิทธิ์แก้ไข) |

---

## การแก้ไขรหัสผ่าน

1. เปิด Google Sheet
2. ไปที่ Sheet "Users"
3. แก้ไขรหัสผ่านในคอลัมน์ B ตาม Role ที่ต้องการ

---

## การเพิ่ม/แก้ไข Config (ตัวเลือก dropdown)

1. เปิด Google Sheet
2. ไปที่ Sheet "Config"
3. เพิ่มแถวข้อมูล format:
   - คอลัมน์ A: key (เช่น `animal`, `sample`, `conclusion`)
   - คอลัมน์ B: value (เช่น `โค`, `กระบือ`)

---

## เทคโนโลยีที่ใช้

- **Frontend**: HTML5, Tailwind CSS (CDN), Chart.js (CDN)
- **Font**: Google Fonts - Sarabun
- **Backend**: Google Apps Script (GAS)
- **Database**: Google Sheets
- **Authentication**: SessionStorage (client-side)

---

## หมายเหตุ

- ระบบไม่มี backend server — ทุกอย่างทำงานผ่าน Google Apps Script
- การ Login จะถูกล้างเมื่อปิด Tab/Browser (sessionStorage)
- ต้องเข้าถึง Google Sheet และ GAS ได้จากเครือข่ายที่ใช้งาน
- หากแก้ไข Code.gs ต้องทำการ Deploy ใหม่ทุกครั้ง
