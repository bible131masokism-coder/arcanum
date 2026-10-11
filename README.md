# Theory of Magic(Editor Version)


**Theory of Magic** เป็นเกมแฟนตาซีแนว idle / incremental RPG ที่เล่นผ่านเว็บ ผู้เล่นจะพัฒนาพ่อมด ทำภารกิจและการผจญภัย ต่อสู้กับมอนสเตอร์ เรียนรู้เวทมนตร์ และสะสมทรัพยากรเพื่อปลดล็อกความก้าวหน้าใหม่ ๆ ตัวเกมสร้างด้วย Vue 3 และ Vite โดยข้อมูลเกมส่วนใหญ่เก็บเป็นไฟล์ JSON

### ฟีเจอร์หลัก

- พัฒนาตัวละครผ่านเลเวล คลาส ทักษะ และเวทมนตร์
- ทำงานและภารกิจเพื่อรับทรัพยากร ปลดล็อกเนื้อหา และเพิ่มความก้าวหน้า
- สำรวจพื้นที่และดันเจียน ต่อสู้กับมอนสเตอร์ และรับของรางวัล
- จัดการอุปกรณ์ การร่ายเวท การปรุงยา และการสร้างไอเท็ม
- ดูแล Wizard Hall และตัวละครหลายตัว
- บันทึกเกมในเบราว์เซอร์ พร้อมนำเข้าและส่งออกไฟล์เซฟ JSON

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


---


**Theory of Magic** is a browser-based fantasy idle / incremental RPG. Build up a wizard, take on tasks and adventures, fight monsters, learn magic, and gather resources to unlock further progression. The game is built with Vue 3 and Vite, with most game content defined in JSON files.

### Features

- Progress a character through levels, classes, skills, and spells.
- Perform tasks and quests to earn resources, unlock content, and advance.
- Explore locations and dungeons, battle monsters, and collect rewards.
- Manage equipment, cast spells, brew potions, and craft items.
- Manage a Wizard Hall and multiple characters.
- Save in the browser and import or export JSON save files.

### Getting started

Install [Node.js](https://nodejs.org/) 18 or later and npm.

```sh
npm install
npm run dev
```

Vite prints the development server URL when it starts. The default is `http://localhost:3000`.

Common commands:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server with hot reload. |
| `npm run build` | Create a production build in `dev/`. |
| `npm run preview -- --outDir dev` | Preview the build output in `dev/`. |
| `npm run silent` | Start the development server with hot reload disabled. |
| `npm run ci-dev` | Run the TypeScript compiler and create a production build. |

> **Warning:** `npm run build` clears the existing contents of `dev/` before writing the new build because Vite also uses this directory as its output directory. Back up files there first, or choose another output directory, for example `npm run build -- --outDir dist`.

### Project layout

| Path | Contents |
| --- | --- |
| `src/` | Game and web application source code. |
| `src/chars/` | Characters, player state, and combat-related logic. |
| `src/composites/` | Combined game systems such as exploration, combat, and running actions. |
| `src/items/` | Runtime item models and game data types. |
| `src/modules/` | Game data loading, profiles, item generation, and persistence. |
| `src/ui/` | Vue user interface. |
| `src/values/` | Numeric values, stats, and modifiers. |
| `data/` | JSON game content; `modules.json` selects core data and optional modules to load. |
| `css/` | Main stylesheet. |
| `docs/` | Game design notes and data documentation. |
| `dev/` | Vite output directory for built web assets. |

### Save data

The game stores browser saves in IndexedDB, with localStorage as a fallback. Clearing site data or switching browsers can remove local saves, so periodically export a JSON backup. Both individual character saves and the Wizard Hall can be imported and exported.
