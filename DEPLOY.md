# LessonBell - Nasazeni do cloudu (Step by Step)

Aplikace se sklada ze dvou casti:
- **Frontend (Next.js)** → nasadit na **Vercel** (zdarma)
- **Databaze/Backend (Convex)** → nasadit na **Convex Cloud** (zdarma)

---

## KROK 1: Zalozeni uctu na Convex (Databaze)

Convex je serverless databaze, ktera uz je v projektu napojena. Staci ji aktivovat.

1. Jdi na **https://dashboard.convex.dev** a zaregistruj se (pres GitHub)
2. Klikni **"New Project"**
3. Pojmenuj projekt napr. `lessonbell`
4. Zvol region (doporucuji **EU** kvuli latenci)
5. Po vytvoreni projektu zkopiruj **Deployment URL** — vypada takto:
   ```
   https://tvuj-projekt-123.convex.cloud
   ```

---

## KROK 2: Nastaveni Convex lokalne

V terminalu v adresari projektu spust:

```bash
# Instalace Convex CLI (pokud jeste neni)
npm install -g convex

# Prihlaseni
npx convex login

# Pripojeni k projektu
npx convex init
# nebo pokud uz mas projekt:
npx convex dev --once
```

Tento prikaz nahraje schema a funkce (`convex/schema.ts`, `convex/classes.ts`, atd.) do Convex cloudu.

### Nasazeni backendu do produkce:

```bash
npx convex deploy
```

Po uspesnem deployi ziskas produkcni URL:
```
https://tvuj-projekt-123.convex.cloud
```

---

## KROK 3: Nahrani kodu na GitHub

Pokud jeste nemas repo na GitHubu:

```bash
# Vytvor novy repozitar na github.com, pak:
git remote add origin https://github.com/TVUJ-UCET/lessonbell.git
git branch -M main
git push -u origin main
```

---

## KROK 4: Nasazeni frontendu na Vercel

1. Jdi na **https://vercel.com** a prihlasi se pres GitHub
2. Klikni **"Add New Project"**
3. Zvol repozitar `lessonbell` z GitHubu
4. Vercel automaticky detekuje Next.js — nemen nastaveni buildu
5. **DULEZITE** — Nastav Environment Variables:
   - Klikni na **"Environment Variables"**
   - Pridej:
     ```
     Nazev:   NEXT_PUBLIC_CONVEX_URL
     Hodnota: https://tvuj-projekt-123.convex.cloud
     ```
   - (Pouzij URL z Kroku 2)
6. Klikni **"Deploy"**

Po par minutach bude aplikace dostupna na:
```
https://lessonbell.vercel.app
```
(nebo jiny nazev podle tveho projektu)

---

## KROK 5: Overeni

1. Otevri URL z Vercelu v prohlizeci
2. Over, ze se zobrazuje rozvrh hodin
3. Zkus pridat novou tridu — data by se mela ulozit do Convex databaze
4. Over v **Convex Dashboard** (https://dashboard.convex.dev), ze se data ukladaji

---

## Volitelne: Vlastni domena

Pokud chces vlastni domenu (napr. `lessonbell.cz`):

1. Na Vercelu jdi do **Settings → Domains**
2. Pridej svou domenu
3. Nastav DNS zaznamy u sveho registratora podle instrukci Vercelu:
   - `A` zaznam: `76.76.21.21`
   - nebo `CNAME`: `cname.vercel-dns.com`

---

## Souhrn nakladu

| Sluzba | Zdarma zahrnuje | Placeny plan |
|--------|----------------|-------------|
| **Vercel** (hosting) | 100 GB bandwidth/mesic, vlastni domena | od $20/mesic |
| **Convex** (databaze) | 1M volani funkci, 1 GB storage | od $25/mesic |

Pro osobni pouziti nebo male mnozstvi studentu bohatne staci **free tier** obou sluzeb.

---

## Alternativni moznosti nasazeni

### Railway.app
- Jednodussi setup, ale nema free tier pro produkci
- `railway init && railway up`

### Fly.io
- Dobre pro Docker kontejnery
- Potrebuje Dockerfile

### Netlify
- Podobne jako Vercel, ale horsi podpora pro Next.js App Router

**Doporuceni:** Vercel + Convex je nejlepsi kombinace pro tento projekt, protoze obe sluzby jsou optimalizovane pro Next.js a serverless architekturu.

---

## Prikazy pro rychly deploy

```bash
# 1. Deploy Convex backendu
npx convex deploy

# 2. Build Next.js frontendu (pro overeni pred deployem)
npm run build

# 3. Push na GitHub (Vercel automaticky udela redeploy)
git add . && git commit -m "Deploy update" && git push
```

## Reseni problemu

### "Chyba: Convex neni nakonfigurovan"
→ Zkontroluj, ze `NEXT_PUBLIC_CONVEX_URL` je spravne nastaveno ve Vercel Environment Variables.

### Build selhava na Vercelu
→ Spust `npm run build` lokalne a oprav TypeScript chyby pred pushem.

### Data se neukladaji
→ Over v Convex Dashboard, ze backend je nasazeny a funkce jsou aktivni.
