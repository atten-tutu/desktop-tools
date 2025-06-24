export type SkinType = 'blue' | 'yellow' | 'cyan';

export const SKIN_COLORS = {
  blue: '#165DFF',    // Arco Blue
  yellow: '#FFCD00',  // Yello
  cyan: '#0FC6C2'     // Cyan
} as const;

export const SKIN_OPTIONS = [
  { label: 'Arco Blue', value: 'blue' },
  { label: 'Yellow', value: 'yellow' },
  { label: 'Cyan', value: 'cyan' },
]; 