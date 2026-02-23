import type { LocationCard, LocationPack } from "./types";

function loc(nb: string, en: string): LocationCard {
  return { name: { nb, en } };
}

const CLASSIC_LOCATIONS: LocationCard[] = [
  loc("Fly", "Airplane"),
  loc("Bank", "Bank"),
  loc("Strand", "Beach"),
  loc("Kino", "Cinema"),
  loc("Sykehus", "Hospital"),
  loc("Hotell", "Hotel"),
  loc("Politistasjon", "Police Station"),
  loc("Restaurant", "Restaurant"),
  loc("Skole", "School"),
  loc("Supermarked", "Supermarket"),
  loc("Kontor", "Office"),
  loc("Bibliotek", "Library"),
  loc("Kjøpesenter", "Shopping Mall"),
  loc("Togstasjon", "Train Station"),
  loc("Stadion", "Stadium"),
  loc("Dyrehage", "Zoo"),
];

const NORWAY_LOCATIONS: LocationCard[] = [
  loc("Fjellhytte", "Mountain Cabin"),
  loc("Skisenter", "Ski Resort"),
  loc("Fjordferge", "Fjord Ferry"),
  loc("Fiskebrygge", "Fishing Pier"),
  loc("Stavkirke", "Stave Church"),
  loc("Tursti", "Mountain Trail"),
  loc("Seter", "Mountain Farm"),
  loc("Hurtigruteterminal", "Coastal Express Terminal"),
  loc("Rorbuhavn", "Fishermen's Cabin Harbor"),
  loc("Nasjonalpark-senter", "National Park Center"),
  loc("Utsiktspunkt", "Scenic Viewpoint"),
  loc("Isfiskeplass", "Ice Fishing Spot"),
  loc("Lakseelv", "Salmon River"),
  loc("Bunadsbutikk", "Bunad Shop"),
  loc("Vaffelstue", "Waffle Cabin"),
];

const CITY_LOCATIONS: LocationCard[] = [
  loc("T-banestasjon", "Metro Station"),
  loc("Kjøpesenter", "Shopping Mall"),
  loc("Treningssenter", "Gym"),
  loc("Kafé", "Cafe"),
  loc("Rådhus", "City Hall"),
  loc("Rettsal", "Courtroom"),
  loc("Brannstasjon", "Fire Station"),
  loc("Veterinærklinikk", "Veterinary Clinic"),
  loc("Frisørsalong", "Hair Salon"),
  loc("Apotek", "Pharmacy"),
  loc("Postkontor", "Post Office"),
  loc("Busstopp", "Bus Stop"),
  loc("Legekontor", "Doctor's Office"),
  loc("Bypark", "City Park"),
  loc("Bakeri", "Bakery"),
];

const TRAVEL_LOCATIONS: LocationCard[] = [
  loc("Flyplass", "Airport"),
  loc("Togstasjon", "Train Station"),
  loc("Bussterminal", "Bus Terminal"),
  loc("Passkontroll", "Passport Control"),
  loc("Turistinformasjon", "Tourist Information"),
  loc("Cruisehavn", "Cruise Port"),
  loc("Leiebilkontor", "Car Rental Office"),
  loc("Fergekai", "Ferry Terminal"),
  loc("Hostell", "Hostel"),
  loc("Campingplass", "Campground"),
  loc("Strandresort", "Beach Resort"),
  loc("Temapark", "Theme Park"),
  loc("Utsiktstårn", "Observation Tower"),
  loc("Markedsplass", "Market Square"),
  loc("Nasjonalpark", "National Park"),
  loc("Fjelljernbane", "Mountain Railway"),
  loc("Gamlebyen", "Old Town"),
];

const WEEKEND_LOCATIONS: LocationCard[] = [
  loc("Escape room", "Escape Room"),
  loc("Karaokebar", "Karaoke Bar"),
  loc("Bowlinghall", "Bowling Alley"),
  loc("Brettspillkafé", "Board Game Cafe"),
  loc("Nattklubb", "Night Club"),
  loc("Konsertarena", "Concert Venue"),
  loc("Takterrasse", "Rooftop Bar"),
  loc("Streetfood-marked", "Street Food Market"),
  loc("Festivalcamp", "Festival Camp"),
  loc("Minigolfbane", "Mini Golf Course"),
  loc("Paintballbane", "Paintball Arena"),
  loc("Drive-in kino", "Drive-in Cinema"),
  loc("Søndagsbrunsj", "Sunday Brunch Spot"),
  loc("Hyttetur", "Cabin Getaway"),
  loc("Badeland", "Water Park"),
  loc("Trampolinepark", "Trampoline Park"),
  loc("Spillhall", "Arcade"),
];

const SPICY_LOCATIONS: LocationCard[] = [
  loc("VIP-lounge", "VIP Lounge"),
  loc("Forhandlingsrom", "Negotiation Room"),
  loc("Kommandosentral", "Command Center"),
  loc("Due diligence-rom", "Due Diligence Room"),
  loc("Compliance-rom", "Compliance Review Room"),
  loc("Juryrom", "Jury Deliberation Room"),
  loc("Kriseledelsesrom", "Crisis Management Room"),
  loc("Backstage", "Backstage Area"),
  loc("Green room", "Green Room"),
  loc("Auksjonshusets bakrom", "Auction Back Office"),
  loc("Diplomatisk mottaksrom", "Diplomatic Reception Room"),
  loc("Lukket styremøte", "Closed Board Meeting"),
  loc("Pokerrom", "Private Poker Room"),
  loc("Sikkerhetsarkiv", "Security Archive"),
  loc("Pressesenter", "Press Operations Center"),
  loc("Datahall", "Data Center Hall"),
  loc("Observability war room", "Observability War Room"),
];

export const PACKS: LocationPack[] = [
  {
    id: "classic",
    emoji: "🕵️",
    name: { nb: "Klassisk", en: "Classic" },
    locations: CLASSIC_LOCATIONS,
  },
  {
    id: "norway",
    emoji: "🇳🇴",
    name: { nb: "Norge", en: "Norway" },
    locations: NORWAY_LOCATIONS,
  },
  {
    id: "city",
    emoji: "🏙️",
    name: { nb: "By", en: "City" },
    locations: CITY_LOCATIONS,
  },
  {
    id: "travel",
    emoji: "✈️",
    name: { nb: "Reise", en: "Travel" },
    locations: TRAVEL_LOCATIONS,
  },
  {
    id: "weekend",
    emoji: "🪩",
    name: { nb: "Helg", en: "Weekend" },
    locations: WEEKEND_LOCATIONS,
  },
  {
    id: "spicy",
    emoji: "🌶️",
    name: { nb: "Spicy Mode", en: "Spicy Mode" },
    locations: SPICY_LOCATIONS,
  },
];
