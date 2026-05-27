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
