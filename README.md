# Spion spillet

Morkt, raskt og lokalt partyspill i nettleseren basert pa social deduction.

`Spion spillet` er laget for pass-the-phone: ingen konto, ingen romkode, bare en telefon rundt bordet.

## Stack

- React 19
- TypeScript 5
- Vite 7

## Kjerneopplevelse

- 3-12 spillere
- 1+ spioner
- Flere lokasjonspakker
- Hemmelig kortvisning per spiller (send telefonen videre)
- Rundetimer + hint
- Avstemning pa slutten (telefonen sendes rundt)
- Spiongjetning
- Resultat + poengtavle
- Sprakstotte: norsk (default) + engelsk

## Kom i gang

```bash
npm install
npm run dev
```

## Scripts

```bash
npm run dev      # lokal utvikling
npm run build    # produksjonsbuild
npm run preview  # preview av build lokalt
```

## Spillflyt

1. Sett opp spillere, antall spioner, tid og lokasjonspakker.
2. Send telefonen rundt og vis hemmelig kort til hver spiller.
3. Diskuter og still sporsmal.
4. Kjor avstemning (telefonen sendes rundt pa nytt).
5. Hvis spion blir tatt: spion far siste sjanse til a gjette lokasjonen.
6. Se resultat og poeng, start ny runde.

## Prosjektstruktur

```text
src/
  App.tsx        # UI og spillflyt
  game.ts        # spilllogikk (round setup, voting, normalize)
  content.ts     # lokasjonspakker og hint
  types.ts       # domene-typer
  styles.css     # hoveddesign
```

## Neste steg

- Enda flere lokasjonspakker
- Valgfrie husregler (f.eks. poengmodell)
- Mulighet for import av egne lokasjonssett
