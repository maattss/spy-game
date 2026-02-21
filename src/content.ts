import type { LocationCard, LocationPack } from "./types";

function loc(nb: string, en: string): LocationCard {
  return { name: { nb, en } };
}

const CLASSIC_LOCATIONS: LocationCard[] = [
  loc("Fly", "Airplane"),
  loc("Bank", "Bank"),
  loc("Strand", "Beach"),
  loc("Teater", "Theater"),
  loc("Kasino", "Casino"),
  loc("Katedral", "Cathedral"),
  loc("Sirkustelt", "Circus Tent"),
  loc("Firmafest", "Corporate Party"),
  loc("Spa", "Day Spa"),
  loc("Ambassade", "Embassy"),
  loc("Sykehus", "Hospital"),
  loc("Hotell", "Hotel"),
  loc("Militærbase", "Military Base"),
  loc("Filmstudio", "Movie Studio"),
  loc("Cruiseskip", "Ocean Liner"),
  loc("Passasjertog", "Passenger Train"),
  loc("Piratskip", "Pirate Ship"),
  loc("Polarstasjon", "Polar Station"),
  loc("Politistasjon", "Police Station"),
  loc("Restaurant", "Restaurant"),
  loc("Skole", "School"),
  loc("Bensinstasjon", "Service Station"),
  loc("Romstasjon", "Space Station"),
  loc("Ubåt", "Submarine"),
  loc("Supermarked", "Supermarket"),
  loc("Universitet", "University"),
  loc("Kontor", "Office"),
  loc("Bibliotek", "Library"),
];

const NORDIC_LOCATIONS: LocationCard[] = [
  loc("Fjellhytte", "Mountain Cabin"),
  loc("Fiskebrygge", "Fishing Pier"),
  loc("Skisenter", "Ski Resort"),
  loc("Sauna", "Sauna"),
  loc("Fergekai", "Ferry Terminal"),
  loc("Campingplass", "Campground"),
  loc("Nasjonalpark", "National Park"),
  loc("Isfiskeplass", "Ice Fishing Spot"),
  loc("Vikingmuseum", "Viking Museum"),
  loc("Havnepromenade", "Harbor Promenade"),
  loc("Reinsdyrleir", "Reindeer Camp"),
  loc("Lysløype", "Ski Trail"),
  loc("Fyrtårn", "Lighthouse"),
  loc("Fjordbåt", "Fjord Boat"),
  loc("Skøytehall", "Ice Arena"),
];

const CITY_LOCATIONS: LocationCard[] = [
  loc("T-banestasjon", "Metro Station"),
  loc("Kjøpesenter", "Shopping Mall"),
  loc("Treningssenter", "Gym"),
  loc("Kafé", "Cafe"),
  loc("Kino", "Cinema"),
  loc("Rådhus", "City Hall"),
  loc("Rettsal", "Courtroom"),
  loc("Byggeplass", "Construction Site"),
  loc("Brannstasjon", "Fire Station"),
  loc("Veterinærklinikk", "Veterinary Clinic"),
  loc("Tatovørstudio", "Tattoo Studio"),
  loc("Bakeri", "Bakery"),
  loc("Musikkfestival", "Music Festival"),
  loc("TV-studio", "TV Studio"),
  loc("Arkadehall", "Arcade"),
];

const TRAVEL_LOCATIONS: LocationCard[] = [
  loc("Flyplass", "Airport"),
  loc("Togstasjon", "Train Station"),
  loc("Bussterminal", "Bus Terminal"),
  loc("Leiebilkontor", "Car Rental Office"),
  loc("Hostell", "Hostel"),
  loc("Dykkesenter", "Diving Center"),
  loc("Safari-leir", "Safari Camp"),
  loc("Havneby", "Port Town"),
  loc("Ruinområde", "Ancient Ruins"),
  loc("Vingård", "Vineyard"),
  loc("Temapark", "Theme Park"),
  loc("Akvapark", "Water Park"),
  loc("Cruiseterminal", "Cruise Terminal"),
  loc("Fjelljernbane", "Mountain Railway"),
  loc("Kystlandsby", "Coastal Village"),
];

export const PACKS: LocationPack[] = [
  {
    id: "classic",
    name: { nb: "Klassisk", en: "Classic" },
    locations: CLASSIC_LOCATIONS,
  },
  {
    id: "nordic",
    name: { nb: "Nordisk", en: "Nordic" },
    locations: NORDIC_LOCATIONS,
  },
  {
    id: "city",
    name: { nb: "Byliv", en: "City Life" },
    locations: CITY_LOCATIONS,
  },
  {
    id: "travel",
    name: { nb: "Reise", en: "Travel" },
    locations: TRAVEL_LOCATIONS,
  },
];
