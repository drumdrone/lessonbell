# LessonBell

Aplikace pro spravu lekci pro soukrome ucitele.

## Technologie

- **Frontend:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Hosting:** Vercel (doporuceno)

## Spusteni

### 1. Instalace zavislosti

```bash
npm install
```

### 2. Nastaveni Supabase

1. Vytvorte projekt na [supabase.com](https://supabase.com)
2. Spustte SQL z `supabase/migrations/001_initial_schema.sql` v SQL Editoru
3. Zkopirujte `.env.local.example` na `.env.local` a vyplnte:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Spusteni

```bash
npm run dev
```

Aplikace bezi na [http://localhost:3000](http://localhost:3000)

## Deployment na Vercel

1. Pushnte kod na GitHub
2. Importujte projekt do [Vercel](https://vercel.com)
3. Pridejte environment variables
4. Deploy!

## Funkce

- Evidence zaku
- Planovani lekci
- Sledovani plateb
- Responsivni design

## Budouci rozvoj

- [ ] Electron desktop aplikace
- [ ] Kalendar s tydennim zobrazenim
- [ ] Email notifikace
- [ ] Export do PDF
