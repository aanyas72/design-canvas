export interface ClientIdentity {
  clientId: string;
  name: string;
  color: string;
}

const STORAGE_KEY = "design-canvas-identity";

const ADJECTIVES = [
  "Amber", "Quiet", "Bold", "Swift", "Hollow", "Bright", "Faded", "Restless",
  "Gentle", "Sharp", "Distant", "Warm", "Cool", "Wild", "Steady", "Loose",
];

const ANIMALS = [
  "Fox", "Heron", "Otter", "Wren", "Lynx", "Hawk", "Mole", "Crane",
  "Badger", "Sparrow", "Marten", "Owl", "Finch", "Vole", "Kite", "Newt",
];

const COLORS = [
  "#f87171", "#fb923c", "#facc15", "#4ade80", "#22d3ee",
  "#818cf8", "#c084fc", "#f472b6", "#a3e635", "#2dd4bf",
];

function randomIdentity(): ClientIdentity {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  return {
    clientId: crypto.randomUUID(),
    name: `${adjective} ${animal}`,
    color,
  };
}

export function getClientIdentity(): ClientIdentity {
  if (typeof window === "undefined") return randomIdentity();

  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as ClientIdentity;
    } catch {
      // fall through to generate a fresh one
    }
  }
  const identity = randomIdentity();
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
  return identity;
}
