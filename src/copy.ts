import type { Locale } from "./types";

export const COPY = {
  nb: {
    tagline: "Alle vet hvor de er. Alle unntatt én.",
    languageLabel: "Språk",
    themeLabel: "Tema",
    norwegian: "Norsk",
    english: "Engelsk",
    dark: "Mørk",
    light: "Lys",

    howToPlay: "Slik spiller dere",
    ruleDeal: "Send telefonen rundt. Alle ser kortet sitt alene.",
    ruleSecret: "Alle får lokasjonen — bortsett fra spionen.",
    ruleTalk: "Beskriv stedet uten å avsløre det. Spionen bløffer.",
    rulePoint: "Til slutt peker alle samtidig ut spionen.",

    players: "Spillere",
    playerCountHint: "3–12 spillere",
    nameFor: "Navn for",
    remove: "Fjern",
    addPlayer: "Legg til spiller",

    spiesCount: "Spioner",
    spyCountHint: "Hvor mange skal jakte i det skjulte?",
    spyCountOption: "Antall spioner:",

    locationPacks: "Lokasjonspakker",
    locationsCount: (count: number) => `${count} steder`,

    startRound: "Start runde",

    passPhoneTo: "Gi telefonen til",
    playerStep: (current: number, total: number) => `Spiller ${current} av ${total}`,
    tapToReveal: "Trykk for å se kortet",
    keepItHidden: "Ingen andre skal se skjermen",
    youAreSpy: "Du er spionen",
    youAreAgent: "Du er agent",
    spyInstruction: "Du vet ikke stedet. Lytt, bløff og gjett deg fram.",
    agentInstruction: "Beskriv stedet — men ikke gjør det for lett for spionen.",
    location: "Lokasjon",
    hideAndPass: "Skjul og gi videre",

    pointKicker: "Siste steg",
    pointTitle: "Pek ut spionen",
    pointInstruction: "Diskuter runden. Når alle er klare teller dere ned fra tre og peker samtidig på den dere tror er spionen.",
    pointCountdown: "Tre — to — én — pek!",
    showResult: "Vis fasit",

    resultKicker: "Fasit",
    spyWas: "Spionen var",
    spiesWere: "Spionene var",
    newRound: "Ny runde",
    toSetup: "Nytt oppsett",
    spyShort: "Spion",
    agentShort: "Agent",
    and: "og",
  },
  en: {
    tagline: "Everyone knows where they are. Everyone but one.",
    languageLabel: "Language",
    themeLabel: "Theme",
    norwegian: "Norwegian",
    english: "English",
    dark: "Dark",
    light: "Light",

    howToPlay: "How to play",
    ruleDeal: "Pass the phone around. Everyone sees their card alone.",
    ruleSecret: "Everyone gets the location — except the spy.",
    ruleTalk: "Describe the place without giving it away. The spy bluffs.",
    rulePoint: "In the end everyone points out the spy at once.",

    players: "Players",
    playerCountHint: "3–12 players",
    nameFor: "Name for",
    remove: "Remove",
    addPlayer: "Add player",

    spiesCount: "Spies",
    spyCountHint: "How many are hunting in secret?",
    spyCountOption: "Number of spies:",

    locationPacks: "Location packs",
    locationsCount: (count: number) => `${count} places`,

    startRound: "Start round",

    passPhoneTo: "Pass the phone to",
    playerStep: (current: number, total: number) => `Player ${current} of ${total}`,
    tapToReveal: "Tap to see your card",
    keepItHidden: "No one else should see the screen",
    youAreSpy: "You are the spy",
    youAreAgent: "You are an agent",
    spyInstruction: "You don't know the place. Listen, bluff and work it out.",
    agentInstruction: "Describe the place — but don't make it easy for the spy.",
    location: "Location",
    hideAndPass: "Hide and pass",

    pointKicker: "Final step",
    pointTitle: "Point out the spy",
    pointInstruction: "Talk it through. When everyone is ready, count down from three and point at the same time.",
    pointCountdown: "Three — two — one — point!",
    showResult: "Show the answer",

    resultKicker: "The answer",
    spyWas: "The spy was",
    spiesWere: "The spies were",
    newRound: "New round",
    toSetup: "New setup",
    spyShort: "Spy",
    agentShort: "Agent",
    and: "and",
  },
} as const;

export type AppText = (typeof COPY)[Locale];
