# SPY

Et raskt sosialt deduksjonsspill for én telefon.
Alle får en lokasjon. Spionen får ingenting. Ingen må røpe seg.

## Konsept

SPY er bygget for korte, intense runder med lav terskel:

- Mobil-first UI
- Norsk og engelsk språk
- Mørk og lys tema
- Tydelig "pass telefonen videre"-flyt

## Spillflyt

1. Sett opp spillere (3-12) og antall spioner.
2. Del ut hemmelige kort én spiller av gangen.
3. Send telefonen én ny runde for hemmelig avstemning.
4. Hvis mistenkt er spion: agentene vinner umiddelbart.
5. Vis resultat og start ny runde.

Regel for tie i avstemning: spionene vinner.

## Hva som er med nå

- 3-12 spillere
- Flere lokasjonspakker (`classic`, `norway`, `city`, `travel`, `weekend`, `spicy`)
- Lokasjoner oversatt til `nb` og `en`
- Ingen auto-utfylling av navn (kun placeholders)

## Hva som er fjernet (bevisst)

- Roller/jobbtitler
- Diskusjonsfase/timer
- Poengtavle/score

## Teknologi

- React 19
- TypeScript 5
- Vite 7
- Radix UI primitives + shadcn-style komponenter

## Kom i gang

```bash
npm install
npm run dev
```

Appen starter typisk på [http://localhost:5173](http://localhost:5173).

## Scripts

```bash
npm run dev      # lokal utvikling
npm run build    # produksjonsbuild
npm run preview  # preview av build
```

## Prosjektstruktur

```text
src/
  App.tsx                           # state + spillflyt
  components/game/phase-sections.tsx # setup/deal/vote/result UI
  content.ts                        # lokasjonspakker og oversettelser
  copy.ts                           # app-tekst (nb/en)
  styles.css                        # tema + layout
```
