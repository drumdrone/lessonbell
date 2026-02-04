# Rozvrh hodin - Časovač pro výuku

Desktopová webová aplikace pro správu rozvrhu hodin s real-time časovačem a automatickými upozorněními. Určeno pro učitele ZUŠ (Základní umělecká škola) pro sledování vyučovacích hodin.

---

## 📋 Obsah

- [Přehled funkcí](#-přehled-funkcí)
- [Technologie a závislosti](#-technologie-a-závislosti)
- [Architektura aplikace](#-architektura-aplikace)
- [Databázové schéma](#-databázové-schéma)
- [Komponenty](#-komponenty)
- [Design systém](#-design-systém)
- [PWA podpora](#-pwa-podpora)
- [Instalace jako Windows aplikace](#-instalace-jako-windows-aplikace)
- [Klávesové zkratky](#-klávesové-zkratky)

---

## 🎯 Přehled funkcí

### Správa rozvrhu hodin
- **Přidávání hodin**: Zadání jména žáka, začátku a konce hodiny (12:00 - 19:00)
- **Editace hodin**: Kliknutím na hodinu v kalendáři se otevře editační dialog
- **Drag & Drop**: Přetahování hodin v kalendáři pro změnu času
- **Rychlé délky**: Přednastavené délky hodin (30, 45, 60, 90 minut)
- **Poznámky**: Rich-text editor (Tiptap) pro poznámky ke každé hodině
- **Multi-škola**: Podpora pro ZUŠ Lanškroun (zelená) a ZUŠ Letohrad (fialová)

### Real-time časovač
- **Živý odpočet**: Zobrazení zbývajícího času aktuální hodiny
- **Progress bar**: Vizuální ukazatel průběhu hodiny
- **Červená linka**: Aktuální čas zobrazený v kalendáři

### Upozornění
- **5 minut před koncem**: Automatické zvukové upozornění (beep)
- **Browser notifikace**: Push notifikace v prohlížeči
- **Notifikace při začátku**: Upozornění na začátek hodiny

### Správa úkolů
- **Globální úkoly**: Úkoly pro všechny žáky dané školy
- **Sledování splnění**: Označování splněných úkolů pro každého žáka
- **Matice úkolů**: Přehledná tabulka žáci × úkoly

### To-Do / Připomínky
- **Osobní připomínky**: Nastavení data a času připomínky
- **Pop-up notifikace**: Vyskakovací okno při dosažení času
- **Snooze funkce**: Odložení připomínky o 5, 15, 30 nebo 60 minut
- **Editace**: Možnost upravit existující připomínky

### Nápověda / Changelog
- **Historie změn**: Přehled hlavních aktualizací aplikace

---

## 🛠 Technologie a závislosti

### Hlavní framework
| Technologie | Verze | Účel |
|-------------|-------|------|
| Next.js | 16.0.10 | React framework s App Router |
| React | 19.2.1 | UI knihovna |
| TypeScript | 5.9.3 | Typová bezpečnost |
| Convex | 1.28.0 | Real-time databáze |

### UI komponenty
| Knihovna | Účel |
|----------|------|
| shadcn/ui | Základní UI komponenty (Button, Card, Dialog, Input, Select, Tabs...) |
| Radix UI | Headless komponenty (Dialog, Popover, Checkbox, Tooltip...) |
| Lucide React | Ikony |
| Tailwind CSS | Utility-first CSS framework |
| Framer Motion | Animace |

### Speciální knihovny
| Knihovna | Účel |
|----------|------|
| @tiptap/react | Rich-text editor pro poznámky |
| date-fns | Práce s datumy |
| sonner | Toast notifikace |
| zod | Validace dat |
| react-hook-form | Formuláře |

### Kompletní seznam závislostí

```json
{
  "dependencies": {
    "@convex-dev/auth": "^0.0.90",
    "@hookform/resolvers": "^5.0.1",
    "@radix-ui/react-accordion": "^1.2.3",
    "@radix-ui/react-alert-dialog": "^1.1.6",
    "@radix-ui/react-checkbox": "^1.1.4",
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-dropdown-menu": "^2.1.6",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-popover": "^1.1.6",
    "@radix-ui/react-progress": "^1.1.2",
    "@radix-ui/react-scroll-area": "^1.2.3",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-separator": "^1.1.2",
    "@radix-ui/react-switch": "^1.1.3",
    "@radix-ui/react-tabs": "^1.1.3",
    "@radix-ui/react-toast": "^1.2.6",
    "@radix-ui/react-tooltip": "^1.1.8",
    "@tiptap/pm": "^3.11.1",
    "@tiptap/react": "^3.11.1",
    "@tiptap/starter-kit": "^3.11.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "convex": "^1.28.0",
    "date-fns": "^3.6.0",
    "embla-carousel-react": "^8.5.2",
    "framer-motion": "^12.6.3",
    "input-otp": "^1.4.2",
    "lucide-react": "^0.548.0",
    "next": "^16.0.10",
    "next-themes": "^0.4.6",
    "react": "^19.2.1",
    "react-day-picker": "^9.11.1",
    "react-dom": "^19.2.1",
    "react-hook-form": "^7.55.0",
    "react-resizable-panels": "^2.1.7",
    "recharts": "^2.15.1",
    "resend": "^6.3.0",
    "sonner": "^2.0.3",
    "tailwind-merge": "^3.1.0",
    "tw-animate-css": "^1.2.5",
    "vaul": "^1.1.2",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.4.21",
    "eslint": "^9",
    "eslint-config-next": "^16.0.0",
    "postcss": "^8.5.3",
    "tailwindcss": "^3.4.17",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "^5.9.3",
    "vitest": "^3.1.1"
  }
}
```

---

## 🏗 Architektura aplikace

### Struktura složek

```
├── app/
│   ├── globals.css          # Globální styly + CSS proměnné
│   ├── layout.tsx           # Root layout s Convex providerem
│   ├── metadata.json        # SEO metadata
│   ├── page.tsx             # Hlavní stránka s taby
│   └── register-sw.tsx      # Registrace service workeru
│
├── components/
│   ├── class-schedule.tsx   # Hlavní kalendář s hodinami
│   ├── tasks-dashboard.tsx  # Dashboard úkolů
│   ├── reminders-panel.tsx  # Panel připomínek
│   ├── reminder-popup.tsx   # Pop-up pro připomínky
│   ├── notes-editor.tsx     # Tiptap rich-text editor
│   ├── changelog.tsx        # Historie změn
│   ├── convex-client-provider.tsx  # Convex provider
│   └── ui/                  # shadcn/ui komponenty
│
├── convex/
│   ├── schema.ts            # Databázové schéma
│   ├── classes.ts           # CRUD pro hodiny
│   ├── tasks.ts             # CRUD pro úkoly
│   ├── reminders.ts         # CRUD pro připomínky
│   ├── changelog.ts         # Queries pro changelog
│   ├── auth.ts              # Autentizace (připraveno)
│   └── http.ts              # HTTP endpointy
│
├── public/
│   ├── manifest.json        # PWA manifest
│   ├── sw.js                # Service worker
│   ├── icon-192.png         # PWA ikona
│   └── icon-512.png         # PWA ikona
│
└── hooks/
    └── use-toast.ts         # Toast hook
```

### Datový tok

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React UI      │────▶│   Convex        │────▶│   Convex DB     │
│   Components    │◀────│   Queries/      │◀────│   (Cloud)       │
│                 │     │   Mutations     │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                                               │
        │              Real-time sync                   │
        └───────────────────────────────────────────────┘
```

---

## 💾 Databázové schéma

### Tabulka `classes` (Hodiny)
| Pole | Typ | Popis |
|------|-----|-------|
| `_id` | Id | Unikátní identifikátor |
| `studentName` | string | Jméno žáka |
| `startTime` | string | Začátek hodiny (HH:MM) |
| `endTime` | string | Konec hodiny (HH:MM) |
| `dayOfWeek` | number | Den v týdnu (0=Ne, 1=Po, ..., 6=So) |
| `isRecurring` | boolean | Opakující se hodina |
| `notes` | string? | Poznámky (HTML z Tiptap) |
| `school` | string? | Škola ("LANSKROUN" nebo "LETOHRAD") |

### Tabulka `tasks` (Úkoly)
| Pole | Typ | Popis |
|------|-----|-------|
| `_id` | Id | Unikátní identifikátor |
| `name` | string | Název úkolu |
| `createdAt` | number | Timestamp vytvoření |
| `school` | string? | Škola |
| `dayOfWeek` | number? | Legacy pole |

### Tabulka `taskCompletions` (Splnění úkolů)
| Pole | Typ | Popis |
|------|-----|-------|
| `_id` | Id | Unikátní identifikátor |
| `taskId` | Id<"tasks"> | Reference na úkol |
| `studentName` | string | Jméno žáka |
| `completedAt` | number | Timestamp splnění |

**Indexy:** `by_task`, `by_student`

### Tabulka `reminders` (Připomínky)
| Pole | Typ | Popis |
|------|-----|-------|
| `_id` | Id | Unikátní identifikátor |
| `title` | string | Text připomínky |
| `school` | string | Škola |
| `remindAt` | number | Timestamp připomínky |
| `snoozedUntil` | number? | Odloženo do |
| `isDismissed` | boolean | Označeno jako hotové |
| `createdAt` | number | Timestamp vytvoření |

**Indexy:** `by_school`, `by_remind_at`

### Tabulka `changelog` (Historie změn)
| Pole | Typ | Popis |
|------|-----|-------|
| `_id` | Id | Unikátní identifikátor |
| `title` | string | Název změny |
| `description` | string | Popis změny |
| `createdAt` | number | Timestamp |
| `date` | string | Datum (YYYY-MM-DD) |

---

## 🧩 Komponenty

### `ClassSchedule` (class-schedule.tsx)
Hlavní komponenta kalendáře s hodinami.

**Funkce:**
- Zobrazení hodin v časové mřížce (12:00 - 19:00)
- Drag & drop pro přesun hodin
- Kliknutí na hodinu otevře editační dialog
- Kliknutí na prázdné místo vytvoří novou hodinu
- Real-time aktualizace času (červená linka)
- Zvukové a browser notifikace
- Barevné rozlišení škol (zelená/fialová)

**Props:**
```typescript
interface ClassScheduleProps {
  selectedDay: number        // Vybraný den (0-6)
  setSelectedDay: (day: number) => void
  showForm: boolean          // Zobrazit formulář
  setShowForm: (show: boolean) => void
}
```

### `TasksDashboard` (tasks-dashboard.tsx)
Dashboard pro správu úkolů.

**Funkce:**
- Přidávání globálních úkolů
- Matice žáci × úkoly
- Označování splnění pro každého žáka
- Filtrování podle školy

### `RemindersPanel` (reminders-panel.tsx)
Panel pro správu připomínek.

**Funkce:**
- Přidávání připomínek s datem a časem
- Editace existujících připomínek
- Mazání připomínek
- Filtrování podle školy

### `ReminderPopup` (reminder-popup.tsx)
Pop-up okno pro aktivní připomínky.

**Funkce:**
- Automatické zobrazení při dosažení času
- Snooze (5, 15, 30, 60 minut)
- Označení jako hotové

### `NotesEditor` (notes-editor.tsx)
Rich-text editor pro poznámky.

**Funkce:**
- Tučné, kurzíva
- Seznamy (odrážky, číslované)
- Automatické ukládání

---

## 🎨 Design systém

### Barevná paleta

Aplikace používá CSS proměnné definované v `globals.css`:

```css
:root {
  --background: 0 0% 100%;        /* Bílé pozadí */
  --foreground: 0 0% 3.9%;        /* Černý text */
  --primary: 0 0% 9%;             /* Primární barva */
  --secondary: 0 0% 96.1%;        /* Sekundární barva */
  --muted: 0 0% 96.1%;            /* Tlumená barva */
  --accent: 0 0% 96.1%;           /* Akcentová barva */
  --destructive: 0 84.2% 60.2%;   /* Červená pro mazání */
  --border: 0 0% 89.8%;           /* Barva okrajů */
  --radius: 0.5rem;               /* Zaoblení rohů */
}
```

### Barvy škol
- **ZUŠ Lanškroun**: `bg-emerald-500` (zelená)
- **ZUŠ Letohrad**: `bg-purple-500` (fialová)

### Gradient
Hlavní gradient pro tlačítka a header:
```css
bg-gradient-to-r from-indigo-600 to-purple-600
```

### Typografie
- **Nadpisy**: `font-bold text-gray-900`
- **Běžný text**: `text-gray-600`
- **Malý text**: `text-sm text-gray-500`

### Komponenty shadcn/ui
Aplikace využívá tyto shadcn/ui komponenty:
- Button, Card, Dialog, Input, Select
- Checkbox, Tabs, Badge, Tooltip
- Toast, Popover, Separator
- ScrollArea, Progress

---

## 📱 PWA podpora

Aplikace je Progressive Web App (PWA) a lze ji nainstalovat jako samostatnou aplikaci.

### Manifest (`public/manifest.json`)
```json
{
  "name": "Rozvrh hodin - Časovač",
  "short_name": "Rozvrh hodin",
  "description": "Aplikace pro správu rozvrhu hodin s časovačem",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "orientation": "portrait",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Service Worker (`public/sw.js`)
Minimální service worker pro PWA instalaci:
- `install` event: Okamžitá aktivace
- `activate` event: Převzetí kontroly
- `fetch` event: Pass-through (bez cache)

---

## 💻 Instalace jako Windows aplikace

### Postup instalace (Chrome)

1. **Otevři aplikaci v Chrome**
2. **Počkej 5 sekund** (service worker se musí zaregistrovat)
3. **Obnov stránku** (F5 nebo Ctrl+R)
4. **Ikona instalace**: V pravé části adresního řádku se objeví ikona instalace (počítač s šipkou dolů) nebo klikni na tři tečky → "Uložit a sdílet" → "Instalovat aplikaci"
5. **Instaluj**: Potvrď "Instalovat"
6. **Otevře se nové okno**: Aplikace se spustí jako samostatné okno

### Nastavení jako side panel (Windows 11)

1. Klikni pravým tlačítkem na ikonu aplikace na hlavním panelu
2. Vyber "Připnout na hlavní panel"
3. Pro "Always on Top" použij PowerToys (Microsoft)

### Poznámka k nativní aplikaci

Tato aplikace je webová aplikace (PWA) a nelze ji přímo exportovat jako `.exe` soubor. Pro vytvoření nativní Windows aplikace by bylo potřeba:
- **Electron** (https://www.electronjs.org/) - wrapper pro webové aplikace
- **Tauri** (https://tauri.app/) - lehčí alternativa k Electronu

---

## ⌨️ Klávesové zkratky

| Zkratka | Akce |
|---------|------|
| `Ctrl + Enter` | Uložit změny v editačním dialogu |

---

## 📊 Stav projektu

### ✅ Dokončené fáze

**Phase 1: Foundation**
- Next.js 16 + React 19 setup
- Convex database setup
- Schema design
- shadcn/ui komponenty
- Základní layout

**Phase 2: Core Features**
- Správa rozvrhu hodin (CRUD)
- Real-time časovač
- Vizuální progress bar
- Zvuková a browser notifikace
- Multi-škola podpora

**Phase 3: Advanced Features**
- Dashboard pro správu úkolů
- Označování splněných úkolů
- Changelog/Nápověda
- PWA podpora
- Responsive design

### 📋 Možná budoucí rozšíření

- [ ] Export rozvrhu do PDF/iCal
- [ ] Statistiky a reporty
- [ ] Opakující se hodiny (týdenní šablony)
- [ ] Email notifikace pro žáky/rodiče
- [ ] Autentizace uživatelů

---

## 🔧 Vývoj

### Spuštění lokálně

```bash
npm install
npm run dev
```

### Build

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

---

*Vytvořeno pro ZUŠ Lanškroun a ZUŠ Letohrad*
