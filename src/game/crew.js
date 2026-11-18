const haulers = [
  ["lest", "Lest", "Châssis de quai", "Dock chassis"],
  ["cabestan", "Cabestan", "Tambour à câble", "Cable drum"],
  ["etau", "Étau", "Mâchoires d’acier", "Steel jaws"],
  ["orque", "Orque", "Coque d’orque", "Orca hull"],
  ["rivet", "Rivet", "Chaudière rivetée", "Riveted boiler"],
  ["etrille", "Étrille", "Pinces de crabe", "Crab claws"],
  ["bison", "Bison", "Fourches jumelles", "Twin forks"],
  ["ponton", "Ponton", "Pont sur chenilles", "Tracked deck"],
  ["enclume", "Enclume", "Bâti de forge", "Forge frame"],
  ["scaphandre", "Scaphandre", "Casque de plongée", "Diving helmet"],
  ["belier", "Bélier", "Lame de poussée", "Pusher blade"],
  ["morse", "Morse", "Défenses d’ivoire", "Ivory tusks"]
];

const scouts = [
  ["sonde", "Sonde", "Nez profilé", "Streamlined nose"],
  ["manta", "Manta", "Ailes de raie", "Ray wings"],
  ["vigie", "Vigie", "Œil périscopique", "Periscope eye"],
  ["nacre", "Nacre", "Coquille nervurée", "Ridged shell"],
  ["lumen", "Lumen", "Lanterne de bord", "Ship’s lantern"],
  ["nautile", "Nautile", "Coque en spirale", "Spiral shell"],
  ["anguille", "Anguille", "Corps articulé", "Articulated body"],
  ["alcyon", "Alcyon", "Bec de martin-pêcheur", "Kingfisher beak"],
  ["luciole", "Luciole", "Feu de poupe", "Stern light"],
  ["compas", "Compas", "Branches de compas", "Compass legs"],
  ["meduse", "Méduse", "Cloche suspendue", "Suspended bell"],
  ["prisme", "Prisme", "Cristal à facettes", "Faceted crystal"]
];

export const FLEET = Object.fromEntries(
  Object.entries({ lest: haulers, sonde: scouts }).map(([role, rows]) => [
    role,
    rows.map(([id, name, fr, en]) => ({ id, name, fr, en }))
  ])
);
export const FLEET_SIZE = haulers.length + scouts.length;

export function readCrew(saved) {
  return Object.fromEntries(
    Object.entries(FLEET).map(([role, models]) => [
      role,
      models.some((robot) => robot.id === saved?.[role]) ? saved[role] : role
    ])
  );
}

export function crewName(crew, role) {
  return FLEET[role].find((robot) => robot.id === crew[role]).name;
}
