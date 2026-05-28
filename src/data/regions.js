// Region / location helpers backed by the locations table mirrored in channels.js.
// Used to render a human-readable location label from a numeric location_id
// without an API round-trip.
import { CHANNELS_AP, CHANNELS_TG } from './channels.js';

const stateLabel = { AP: 'Andhra Pradesh', TG: 'Telangana' };

// Pre-built id → entry index for O(1) lookups
const LOCATION_INDEX = (() => {
  const idx = new Map();
  for (const c of CHANNELS_AP) if (!idx.has(c.id)) idx.set(c.id, { ...c, state: 'AP' });
  for (const c of CHANNELS_TG) if (!idx.has(c.id)) idx.set(c.id, { ...c, state: 'TG' });
  return idx;
})();

export function getLocationById(id) {
  if (id == null) return null;
  return LOCATION_INDEX.get(Number(id)) || null;
}

export function getLocationNameFromId(id) {
  const loc = getLocationById(id);
  if (!loc) return '';
  return `${loc.name}, ${stateLabel[loc.state] || ''}`.replace(/,\s*$/, '');
}

// Pre-built name → numeric locations.id lookup. The location picker stores the
// chosen constituency by its English name (e.g. "Kurnool"), but the backend
// content APIs filter by the numeric locations.id, so this resolves one to the
// other. Keys are lowercased names, both state-scoped ("AP:kurnool") and bare
// ("kurnool"); first occurrence wins, so the live channels (listed first in
// channels.js) take precedence over later same-name entries.
const NAME_INDEX = (() => {
  const idx = new Map();
  const add = (c, state) => {
    const key = String(c.name).trim().toLowerCase();
    const stateKey = `${state}:${key}`;
    if (!idx.has(stateKey)) idx.set(stateKey, c.id);
    if (!idx.has(key)) idx.set(key, c.id);
  };
  for (const c of CHANNELS_AP) add(c, 'AP');
  for (const c of CHANNELS_TG) add(c, 'TG');
  return idx;
})();

export function getLocationIdFromName(name, state) {
  if (!name) return null;
  const key = String(name).trim().toLowerCase();
  if (state) {
    const scoped = NAME_INDEX.get(`${String(state).trim().toUpperCase()}:${key}`);
    if (scoped != null) return scoped;
  }
  const any = NAME_INDEX.get(key);
  return any != null ? any : null;
}
