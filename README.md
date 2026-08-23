# 🕵️ SPY

> *Alle vet lokasjonen. Spionen gjør det ikke. Ingen vet hvem spionen er.*

Et kjapt og intenst sosialt deduksjonsspill for én telefon — perfekt for vennegjenger, familiesammenkomster og alle som liker å lyve med stil.

---

## 🎮 Slik spiller dere

Send telefonen rundt. Alle får vite lokasjonen. Alle, bortsett fra **spionen**.

1. 👥 **Sett opp** spillere (3–12) og velg antall spioner
2. 🃏 **Del ut** hemmelige kort — én spiller av gangen, ingen kikking!
3. 🗣️ **Diskuter** hvem som virker mistenkelig
4. 👉 **Pek ut spionen** — tell ned fra tre og pek samtidig
5. 🏆 **Vis fasit** og start en ny runde

> **Avstemning i appen?** Nei. Dere peker i gruppa — det er sånn det gjøres.

---

## 📦 Lokasjonspakker

| Pakke | Innhold |
|-------|---------|
| 🕵️ **Klassisk** | Fly, bank, sykehus, kino og mer |
| 🇳🇴 **Norge** | Preikestolen, Bryggen, Holmenkollen og norske landemerker |
| 🎿 **Afterski** | Skibar, heiskø, hyttefest og fjellstemning |
| ⭐ **Kjendis** | Røde løperen, filmset, VIP-loge og glamour |
| 🇳🇴 **17. mai** | Barnetoget, bunaden, flaggheising og nasjonaldagsfest |
| 🪩 **Helg** | Escape room, karaokebar, trampolinepark og moro |
| 🌶️ **Ekspert** | Forhandlingsrom, juryrom, lukket styremøte og høy spenning |

---

## ✨ Designvalg

SPY er laget for å være **raskt**, **lettfattelig** og **mobilsentrisk**:

- 📱 Mobil-first UI — ingen installasjon, bare åpne i nettleseren
- 🃏 Kortet snus med en 3D-flip, og innholdet fjernes før telefonen gis videre
- 🌍 Norsk og engelsk språk
- 🌙 Mørk, lys og Norge-tema
- ➡️ Tydelig "pass telefonen videre"-flyt
- 🔁 Roterende startspiller mellom runder

**Bevisst utelatt** (for å holde det enkelt): avstemning i appen, roller/jobbtitler,
diskusjonstimer og poengtavle. Spionen pekes ut i gruppa — appen viser bare fasiten.

---

## 🛠️ Teknologi

- [React 19](https://react.dev/)
- [TypeScript 5](https://www.typescriptlang.org/)
- [Vite 7](https://vitejs.dev/)
- [Radix UI](https://www.radix-ui.com/) primitives + shadcn-style komponenter

---

## 🚀 Kom i gang

```bash
npm install
npm run dev
```

Appen starter på [http://localhost:5173](http://localhost:5173). Inviter venner. Ha det gøy.

```bash
npm run dev      # lokal utvikling
npm run build    # produksjonsbuild
npm run preview  # preview av build
```

---

## 📁 Prosjektstruktur

```text
src/
  App.tsx                            # state + spillflyt
  components/game/phase-sections.tsx # setup/deal/point/result UI
  content.ts                         # lokasjonspakker og oversettelser
  copy.ts                            # app-tekst (nb/en)
  styles.css                         # tema + layout
```
