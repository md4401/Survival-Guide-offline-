// International ground-to-air emergency signals (to be laid out large on the ground) and basic distress conventions. Needs review.
export const GROUND_SIGNALS: Array<{ id: string; mark: string }> = [
  { id: 'help', mark: 'V' }, { id: 'medical', mark: 'X' }, { id: 'no', mark: 'N' }, { id: 'yes', mark: 'Y' }, { id: 'direction', mark: '↑' },
];
export const SIGNAL_COLORS: Array<[string, string, string]> = [['redwhite', '#ff0000', '#ffffff'], ['yellowblack', '#ffd400', '#000000'], ['whiteblack', '#ffffff', '#000000']];
