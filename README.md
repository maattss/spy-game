# Spy Web

Web-basert partyspill inspirert av "Spy"-konseptet (social deduction / pass-the-phone).

## Stack

- React 19
- TypeScript 5
- Vite 7

## Kom i gang

```bash
npm install
npm run dev
```

## Inkludert i MVP

- 3-12 spillere
- 1+ spioner
- Klassisk lokasjonspakke med roller
- Roller for ikke-spioner
- Hemmelig kortvisning med "send telefonen videre"
- Rundetimer + hint
- Avstemning
- Spiongjetning
- Resultat + enkel poengtavle
- Sprakstotte (norsk som standard + engelsk)

## Neste naturlige steg

- Flere pakker og eksakt 1:1 import av lokasjoner/roller fra mobilappen

## Auto deploy (Vercel)

Repoet inneholder workflowen `.github/workflows/vercel-deploy-main.yml` som kjores automatisk ved push til `main`.

For at den skal fungere, legg inn disse GitHub Secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Du finner `VERCEL_ORG_ID` og `VERCEL_PROJECT_ID` i Vercel-prosjektet ditt (Project Settings), og token lager du i Vercel under Account Settings -> Tokens.
