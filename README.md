# Theory of Magic(Editor Version)

<p align="center">
  <img alt="Vue 3" src="https://img.shields.io/badge/Vue-3-42b883?logo=vuedotjs&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white" />
  <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-ES6-F7DF1E?logo=javascript&logoColor=black" />
</p>

A browser-based fantasy idle / incremental RPG where players build a wizard, complete quests, explore magical lands, battle monsters, learn spells, and grow their power over time.

Theory of Magic is built with Vue 3 and Vite, with most world content driven by JSON data files to make balancing and expansion easier.

**Theory of Magic** เป็นเกมแฟนตาซีแนว idle / incremental RPG ที่เล่นผ่านเว็บ ผู้เล่นจะพัฒนาพ่อมด ทำภารกิจและการผจญภัย ต่อสู้กับมอนสเตอร์ เรียนรู้เวทมนตร์ และสะสมทรัพยากรเพื่อปลดล็อกความก้าวหน้าใหม่ ๆ ตัวเกมสร้างด้วย Vue 3 และ Vite โดยข้อมูลเกมส่วนใหญ่เก็บเป็นไฟล์ JSON

### ฟีเจอร์หลัก

- พัฒนาตัวละครผ่านเลเวล คลาส ทักษะ และเวทมนตร์
- ทำงานและภารกิจเพื่อรับทรัพยากร ปลดล็อกเนื้อหา และเพิ่มความก้าวหน้า
- สำรวจพื้นที่และดันเจียน ต่อสู้กับมอนสเตอร์ และรับของรางวัล
- จัดการอุปกรณ์ การร่ายเวท การปรุงยา และการสร้างไอเท็ม
- ดูแล Wizard Hall และตัวละครหลายตัว
- บันทึกเกมในเบราว์เซอร์ พร้อมนำเข้าและส่งออกไฟล์เซฟ JSON

### การเร่งเวลา (Fast-forward)

กดปุ่ม **"เร่งเวลา"** บนแถบด้านบนเพื่อให้เกมเดินเร็วขึ้นแบบเรียลไทม์ ตามตัวคูณความเร็วที่ตั้งได้ใน Settings → "ความเร็วเร่งเวลา" (ค่าเริ่มต้น 10 เท่า) แล้วกดปุ่มอีกครั้งเพื่อหยุด

ในเวอร์ชันนี้ระบบการเร่งเวลาทำงานแบบเรียลไทม์และ**ไม่ต้องพึ่ง "เวลาออฟไลน์ที่สะสมไว้" (stored time) อีกต่อไป**:
- เร่งเวลาได้ทันทีโดยไม่ต้องใช้เวลาที่สะสมไว้จากการปล่อยเกมทิ้งหรือปิดแท็บ
- โหมดเร่งเวลาจะไม่หยุดเองเมื่อเวลาสะสมหมด ต้องกดปุ่มเพื่อปิดเอง
- ไม่มีการสะสมเวลาออฟไลน์เข้า "stored time" (`offlinetime`) อีกแล้ว

> หมายเหตุ: ทรัพยากร "stored time" ยังคงมีอยู่และยังถูกใช้โดยระบบเกมอื่น (เช่น ภารกิจ/อีเวนต์) แต่ไม่จำเป็นสำหรับการเร่งเวลาอีกต่อไป

### เริ่มต้นใช้งาน

ต้องติดตั้ง [Node.js](https://nodejs.org/) 18 ขึ้นไป และ npm ก่อน

```sh
npm install
npm run dev
```

Vite จะแสดง URL ของเซิร์ฟเวอร์พัฒนาหลังเริ่มทำงาน โดยค่าปกติคือ `http://localhost:3000`

คำสั่งที่ใช้บ่อย:

| คำสั่ง | รายละเอียด |
| --- | --- |
| `npm run dev` | เริ่มเซิร์ฟเวอร์พัฒนาพร้อม hot reload |
| `npm run build` | สร้างไฟล์สำหรับ production ไปยัง `dev/` |
| `npm run preview -- --outDir dev` | เปิดดูไฟล์ build ที่สร้างไว้ใน `dev/` |
| `npm run silent` | เริ่มเซิร์ฟเวอร์พัฒนาโดยปิด hot reload |
| `npm run ci-dev` | รัน TypeScript compiler และสร้าง production build |

> **ระวัง:** `npm run build` จะล้างไฟล์เดิมใน `dev/` ก่อนสร้างไฟล์ใหม่ เพราะโฟลเดอร์นี้เป็น output directory ของ Vite ด้วย หากต้องการเก็บไฟล์ที่มีอยู่ ให้สำรองข้อมูลก่อน หรือระบุ output directory อื่น เช่น `npm run build -- --outDir dist`

### โครงสร้างโปรเจกต์

| พาธ | เนื้อหา |
| --- | --- |
| `src/` | โค้ดเกมและเว็บแอป |
| `src/chars/` | ตัวละคร ผู้เล่น สถานะ และการต่อสู้ |
| `src/composites/` | ระบบประกอบ เช่น การสำรวจ การต่อสู้ และงานที่กำลังทำ |
| `src/items/` | โมเดลไอเท็มและข้อมูลเกมที่ทำงานระหว่างเล่น |
| `src/modules/` | โหลดข้อมูลเกม โปรไฟล์ การสร้างไอเท็ม และระบบบันทึก |
| `src/ui/` | ส่วนติดต่อผู้ใช้ที่สร้างด้วย Vue |
| `src/values/` | ค่าตัวเลข สถิติ และตัวปรับแต่งต่าง ๆ |
| `data/` | ข้อมูลเกม JSON; `modules.json` ระบุข้อมูลหลักและโมดูลเสริมที่จะโหลด |
| `css/` | สไตล์ชีตหลัก |
| `docs/` | บันทึกการออกแบบและเอกสารประกอบข้อมูลเกม |
| `dev/` | โฟลเดอร์ output ของ Vite สำหรับไฟล์เว็บที่ build แล้ว |

### ข้อมูลเซฟ

เกมบันทึกข้อมูลในเบราว์เซอร์ผ่าน IndexedDB และมี localStorage เป็น fallback การล้างข้อมูลเว็บไซต์หรือเปลี่ยนเบราว์เซอร์อาจทำให้เซฟในเครื่องหายได้ ควรส่งออกไฟล์เซฟ JSON เก็บไว้เป็นระยะ โดยเกมรองรับทั้งการนำเข้า/ส่งออกเซฟตัวละครและ Wizard Hall

## Highlights

- Level up characters through classes, skills, and magical progression
- Accept quests and tasks to gain resources and unlock new content
- Explore locations, dungeons, and monster encounters
- Manage equipment, spellcasting, crafting, and alchemy
- Maintain a Wizard Hall and multiple characters in one save profile
- Import/export game saves as JSON for backup and portability
- Content-driven design using `data/*.json` for monsters, items, spells, and modules

## Gameplay overview

- Build a wizard and advance through progression systems
- Fight enemies, gather loot, and earn resources
- Unlock new areas, classes, and magical abilities
- Upgrade your hall and manage a growing roster of characters
- Save directly in the browser with IndexedDB and fallback storage support

## Fast-forward (เร่งเวลา)

Click the **Fast-forward** button in the top bar to run the game faster in real time, at a multiplier you can set in Settings → "Fastforward speed" (default 10×). Click it again to stop.

In this build the fast-forward system works in real time and **no longer depends on accumulated "stored time"**:
- It runs immediately without spending banked offline time.
- It stays active until you toggle it off (it no longer auto-stops when stored time runs out).
- Offline overflow is no longer banked into the "stored time" (`offlinetime`) resource.

> Note: the `offlinetime` ("stored time") resource still exists and is still used by other game systems (e.g. tasks/events), but it is no longer required for fast-forwarding.

## Getting started

Requirements:

- [Node.js](https://nodejs.org/) 18+
- npm

```bash
npm install
npm run dev
```

After starting, Vite will print the local development URL. By default, this is usually:

```text
http://localhost:3000
```

## Common commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Build the production bundle into `dev/` |
| `npm run preview -- --outDir dev` | Preview the built app from `dev/` |
| `npm run silent` | Start Vite without hot reload |
| `npm run ci-dev` | Run TypeScript and generate a production build |
| `npm run pretty-src` | Format source files in `src/` with Prettier |
| `npm run pretty-data` | Format JSON content in `data/` |

> Warning: `npm run build` clears the existing `dev/` directory before generating the new build, because Vite uses that folder as its output directory. If you want to keep the old assets, back them up first or choose another output folder such as `npm run build -- --outDir dist`.

## Project structure

| Path | Purpose |
| --- | --- |
| `src/` | Main game and app source code |
| `src/chars/` | Characters, player state, and combat logic |
| `src/composites/` | Exploration, combat, and action systems |
| `src/items/` | Runtime item definitions and gameplay data |
| `src/modules/` | Persistence, data loading, profiles, and generation |
| `src/ui/` | Vue-based user interface |
| `src/values/` | Stats, numeric values, and modifiers |
| `data/` | Game content such as spells, monsters, quests, and modules |
| `css/` | Main stylesheet |
| `docs/` | Design notes and documentation |
| `dev/` | Vite output directory for built web assets |

## Save system

The game stores browser saves with IndexedDB and uses localStorage as a fallback. If you clear site data or switch browsers, local saves may disappear, so exporting a JSON backup is recommended.

The project supports importing and exporting both character saves and Wizard Hall data.

## Stack

- Vue 3
- Vite
- JavaScript
- JSON-driven content architecture
