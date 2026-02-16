import type { Locale, LocationPack } from "./types";

export const HINT_QUESTIONS: Record<Locale, string[]> = {
  nb: [
    "Er dette et sted man vanligvis blir lenge?",
    "Ville du tatt med barn hit?",
    "Trenger man spesialutstyr her?",
    "Er dette stedet mest innendors eller utendors?",
    "Er dette et sted de fleste har vaert?",
    "Er dette stedet stille eller travelt?",
    "Kan man jobbe pa dette stedet?",
    "Er dette stedet oftest knyttet til fritid?",
  ],
  en: [
    "Is this a place where people usually stay for a while?",
    "Would you bring children here?",
    "Do you need special equipment here?",
    "Is this place mostly indoors or outdoors?",
    "Have most people been here before?",
    "Is this place usually quiet or busy?",
    "Can people work at this place?",
    "Is this place mostly associated with leisure time?",
  ],
};

export const PACKS: LocationPack[] = [
  {
    id: "classic",
    name: { nb: "Klassisk", en: "Classic" },
    locations: [
      {
        name: "Airplane",
        roles: ["First Class Passenger", "Air Marshal", "Mechanic", "Flight Attendant", "Co-Pilot", "Captain", "Economy Class Passenger"],
      },
      {
        name: "Bank",
        roles: ["Armored Car Driver", "Manager", "Consultant", "Robber", "Security Guard", "Teller", "Customer"],
      },
      {
        name: "Beach",
        roles: ["Beach Waitress", "Kite Surfer", "Lifeguard", "Thief", "Beach Goer", "Photographer", "Ice Cream Truck Driver"],
      },
      {
        name: "Broadway Theater",
        roles: ["Coat Check Lady", "Prompter", "Cashier", "Visitor", "Director", "Actor", "Crewman"],
      },
      {
        name: "Casino",
        roles: ["Bartender", "Head Security Guard", "Bouncer", "Manager", "Hustler", "Dealer", "Gambler"],
      },
      {
        name: "Cathedral",
        roles: ["Priest", "Beggar", "Sinner", "Tourist", "Sponsor", "Chorister", "Parishioner"],
      },
      {
        name: "Circus Tent",
        roles: ["Acrobat", "Animal Trainer", "Magician", "Fire Eater", "Clown", "Juggler", "Visitor"],
      },
      {
        name: "Corporate Party",
        roles: ["Entertainer", "Manager", "Unwanted Guest", "Owner", "Secretary", "Delivery Boy", "Accountant"],
      },
      {
        name: "Crusader Army",
        roles: ["Monk", "Imprisoned Saracen", "Servant", "Bishop", "Squire", "Archer", "Knight"],
      },
      {
        name: "Day Spa",
        roles: ["Customer", "Stylist", "Masseuse", "Manicurist", "Makeup Artist", "Dermatologist", "Beautician"],
      },
      {
        name: "Embassy",
        roles: ["Security Guard", "Secretary", "Ambassador", "Tourist", "Refugee", "Diplomat", "Government Official"],
      },
      {
        name: "Hospital",
        roles: ["Nurse", "Doctor", "Anesthesiologist", "Intern", "Therapist", "Surgeon", "Patient"],
      },
      {
        name: "Hotel",
        roles: ["Doorman", "Security Guard", "Manager", "Housekeeper", "Customer", "Bartender", "Bellman"],
      },
      {
        name: "Military Base",
        roles: ["Deserter", "Colonel", "Medic", "Sniper", "Officer", "Tank Engineer", "Soldier"],
      },
      {
        name: "Movie Studio",
        roles: ["Stuntman", "Sound Engineer", "Cameraman", "Director", "Costume Artist", "Actor", "Producer"],
      },
      {
        name: "Ocean Liner",
        roles: ["Rich Passenger", "Captain", "Bartender", "Musician", "Waiter", "Mechanic", "Sailor"],
      },
      {
        name: "Passenger Train",
        roles: ["Mechanic", "Border Patrol", "Train Attendant", "Restaurant Chef", "Engineer", "Stoker", "Passenger"],
      },
      {
        name: "Pirate Ship",
        roles: ["Cook", "Sailor", "Cannoneer", "Bound Prisoner", "Cabin Boy", "Brave Captain", "Swordsman"],
      },
      {
        name: "Polar Station",
        roles: ["Medic", "Geologist", "Radio Operator", "Hydrologist", "Meteorologist", "Biologist", "Expedition Leader"],
      },
      {
        name: "Police Station",
        roles: ["Detective", "Lawyer", "Journalist", "Criminalist", "Archivist", "Criminal", "Patrol Officer"],
      },
      {
        name: "Restaurant",
        roles: ["Musician", "Customer", "Hostess", "Head Chef", "Food Critic", "Waiter", "Bouncer"],
      },
      {
        name: "School",
        roles: ["Gym Teacher", "Principal", "Security Guard", "Janitor", "Cafeteria Lady", "Maintenance Man", "Student"],
      },
      {
        name: "Service Station",
        roles: ["Manager", "Tire Specialist", "Motorcycle Enthusiast", "Car Owner", "Car Wash Operator", "Electrician", "Auto Mechanic"],
      },
      {
        name: "Space Station",
        roles: ["Engineer", "Alien", "Pilot", "Commander", "Scientist", "Doctor", "Space Tourist"],
      },
      {
        name: "Submarine",
        roles: ["Cook", "Commander", "Sonar Technician", "Electronics Technician", "Radioman", "Navigator", "Sailor"],
      },
      {
        name: "Supermarket",
        roles: ["Customer", "Cashier", "Butcher", "Janitor", "Food Sample Demonstrator", "Security Guard", "Shelf Stocker"],
      },
      {
        name: "University",
        roles: ["Graduate Student", "Professor", "Dean", "Psychologist", "Janitor", "Student", "Teacher's Assistant"],
      },
      {
        name: "World War II Squad",
        roles: ["Resistance Fighter", "Medic", "Scout", "Radio Operator", "Refugee", "Soldier", "Commander"],
      },
    ],
  },
];
