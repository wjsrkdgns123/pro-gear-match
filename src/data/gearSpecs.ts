// Gear specs database for "user vs pro" comparison feature.
// Only popular items (top 30 per category) need entries — comparison
// gracefully degrades to "no explanation" when an item is missing.
//
// Key by canonical (color-stripped) name in lowercase. The lookup
// helper strips trailing color words + normalizes whitespace before
// matching so "Razer Viper V3 Pro Black" and "Razer Viper V3 Pro"
// both resolve to the same entry.

export interface MouseSpec {
  weight: number;        // grams
  shape: 'sym' | 'erg' | 'small-sym' | 'asym';
  sensor?: string;
  wireless?: boolean;
}

export interface KeyboardSpec {
  layout: '60%' | '65%' | '75%' | 'TKL' | 'TKL+' | 'full';
  switchType: 'hall-effect' | 'mechanical' | 'optical';
  rapidTrigger?: boolean;
  pollHz?: number;
}

export interface MonitorSpec {
  hz: number;
  resolution?: '1080p' | '1440p' | '4k';
  panelType?: 'TN' | 'IPS' | 'OLED' | 'Fast IPS';
  responseMs?: number;
}

export interface MousepadSpec {
  friction: 'speed' | 'control' | 'hybrid';
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  surface?: 'cloth' | 'hard' | 'hybrid';
}

// Color/edition words to strip from name before matching.
const COLOR_SUFFIX_RE = /\b(black|white|red|blue|green|pink|purple|orange|yellow|grey|gray|silver|gold|rose|magenta|cyan|teal|navy|coral|mint|violet|indigo|crimson|scarlet|amber|ivory|charcoal|glossy|matte|maroon|beige|olive|lime|fluorescent|neon|frost|ghost)\b/gi;

export function normalizeGearKey(name: string): string {
  return name
    .replace(COLOR_SUFFIX_RE, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .toLowerCase();
}

// ─── MOUSE SPECS ─────────────────────────────────────────────────────────
export const MOUSE_SPECS: Record<string, MouseSpec> = {
  'logitech g pro x superlight 2':       { weight: 60, shape: 'sym',       sensor: 'HERO 2', wireless: true },
  'logitech g pro x superlight':         { weight: 63, shape: 'sym',       sensor: 'HERO 25K', wireless: true },
  'logitech g pro x2 superstrike':       { weight: 60, shape: 'sym',       sensor: 'HERO 2', wireless: true },
  'logitech g pro wireless':             { weight: 80, shape: 'sym',       sensor: 'HERO 16K', wireless: true },
  'logitech g pro':                      { weight: 85, shape: 'sym',       sensor: 'HERO 16K', wireless: false },
  'razer viper v3 pro':                  { weight: 54, shape: 'sym',       sensor: 'Focus Pro 35K', wireless: true },
  'razer viper v4 pro':                  { weight: 55, shape: 'sym',       sensor: 'Focus Pro X', wireless: true },
  'razer viper v2 pro':                  { weight: 58, shape: 'sym',       sensor: 'Focus Pro 30K', wireless: true },
  'razer viper':                         { weight: 69, shape: 'sym',       sensor: 'Focus+', wireless: false },
  'razer deathadder v3 pro':             { weight: 63, shape: 'erg',       sensor: 'Focus Pro 30K', wireless: true },
  'razer deathadder v4 pro':             { weight: 56, shape: 'erg',       sensor: 'Focus Pro X', wireless: true },
  'razer deathadder v3':                 { weight: 64, shape: 'erg',       sensor: 'Focus Pro 30K', wireless: false },
  'razer cobra pro':                     { weight: 78, shape: 'sym',       sensor: 'Focus Pro 30K', wireless: true },
  'zowie ec2-cw':                        { weight: 75, shape: 'erg',       sensor: 'PAW3395', wireless: true },
  'zowie ec2-dw':                        { weight: 73, shape: 'erg',       sensor: 'PAW3395', wireless: true },
  'zowie ec1-cw':                        { weight: 78, shape: 'erg',       sensor: 'PAW3395', wireless: true },
  'zowie ec2':                           { weight: 90, shape: 'erg',       sensor: '3360', wireless: false },
  'zowie ec1':                           { weight: 93, shape: 'erg',       sensor: '3360', wireless: false },
  'zowie fk1':                           { weight: 87, shape: 'sym',       sensor: '3360', wireless: false },
  'zowie fk2-dw':                        { weight: 65, shape: 'sym',       sensor: 'PAW3395', wireless: true },
  'zowie u2':                            { weight: 60, shape: 'sym',       sensor: 'PAW3395', wireless: true },
  'zowie s1':                            { weight: 87, shape: 'sym',       sensor: '3360', wireless: false },
  'zowie s2':                            { weight: 82, shape: 'sym',       sensor: '3360', wireless: false },
  'pulsar es fs-1':                      { weight: 52, shape: 'sym',       sensor: 'PAW3395', wireless: true },
  'pulsar x2':                           { weight: 55, shape: 'sym',       sensor: 'PAW3395', wireless: true },
  'pulsar x2 v2':                        { weight: 52, shape: 'sym',       sensor: 'XS-1', wireless: true },
  'pulsar x2 mini':                      { weight: 52, shape: 'small-sym', sensor: 'PAW3395', wireless: true },
  'pulsar xlite v3':                     { weight: 58, shape: 'erg',       sensor: 'XS-1', wireless: true },
  'lamzu atlantis':                      { weight: 55, shape: 'sym',       sensor: 'PAW3395', wireless: true },
  'lamzu atlantis og v2 pro':            { weight: 49, shape: 'sym',       sensor: 'PAW3950', wireless: true },
  'lamzu maya':                          { weight: 50, shape: 'sym',       sensor: 'PAW3950', wireless: true },
  'lamzu maya x':                        { weight: 47, shape: 'sym',       sensor: 'PAW3950', wireless: true },
  'lamzu thorn':                         { weight: 52, shape: 'erg',       sensor: 'PAW3395', wireless: true },
  'finalmouse starlight-12':             { weight: 47, shape: 'sym',       sensor: 'Mercury', wireless: true },
  'finalmouse ultralight 2':             { weight: 47, shape: 'sym',       sensor: '3360', wireless: false },
  'wlmouse beast x':                     { weight: 49, shape: 'sym',       sensor: 'PAW3395', wireless: true },
  'wlmouse beast x mini':                { weight: 42, shape: 'small-sym', sensor: 'PAW3395', wireless: true },
  'vaxee xe wireless':                   { weight: 67, shape: 'sym',       sensor: '3389', wireless: true },
  'vaxee zygen np-01s':                  { weight: 76, shape: 'erg',       sensor: '3389', wireless: false },
  'vaxee outset ax':                     { weight: 78, shape: 'sym',       sensor: '3389', wireless: false },
  'glorious model o wireless':           { weight: 69, shape: 'sym',       sensor: 'BAMF', wireless: true },
  'glorious model o':                    { weight: 67, shape: 'sym',       sensor: '3360', wireless: false },
  'glorious model o-':                   { weight: 58, shape: 'small-sym', sensor: '3360', wireless: false },
  'ninjutso sora':                       { weight: 45, shape: 'sym',       sensor: 'PAW3370', wireless: true },
  'ninjutso sora v2':                    { weight: 45, shape: 'sym',       sensor: 'PAW3950', wireless: true },
  'endgame gear op1 8k':                 { weight: 50, shape: 'sym',       sensor: 'PAW3395', wireless: false },
  'endgame gear xm2we':                  { weight: 63, shape: 'sym',       sensor: 'PAW3370', wireless: true },
  'endgame gear op1w 4k':                { weight: 56, shape: 'sym',       sensor: 'PAW3395', wireless: true },
  'asus rog harpe ace':                  { weight: 54, shape: 'sym',       sensor: 'AimPoint', wireless: true },
  'hitscan hyperlight':                  { weight: 47, shape: 'sym',       sensor: 'PAW3950', wireless: true },
  'arbiter studio akitsu':               { weight: 49, shape: 'sym',       sensor: 'PAW3395', wireless: true },
};

// ─── KEYBOARD SPECS ──────────────────────────────────────────────────────
export const KEYBOARD_SPECS: Record<string, KeyboardSpec> = {
  'wooting 60he':                                 { layout: '60%',  switchType: 'hall-effect', rapidTrigger: true, pollHz: 1000 },
  'wooting 60he+':                                { layout: '60%',  switchType: 'hall-effect', rapidTrigger: true, pollHz: 1000 },
  'wooting 60he v2':                              { layout: '60%',  switchType: 'hall-effect', rapidTrigger: true, pollHz: 8000 },
  'wooting 80he':                                 { layout: 'TKL',  switchType: 'hall-effect', rapidTrigger: true, pollHz: 8000 },
  'wooting two he':                               { layout: 'full', switchType: 'hall-effect', rapidTrigger: true, pollHz: 1000 },
  'razer huntsman v3 pro tkl':                    { layout: 'TKL',  switchType: 'optical',     rapidTrigger: true, pollHz: 8000 },
  'razer huntsman v3 pro mini':                   { layout: '60%',  switchType: 'optical',     rapidTrigger: true, pollHz: 8000 },
  'razer huntsman v3 pro':                        { layout: 'full', switchType: 'optical',     rapidTrigger: true, pollHz: 8000 },
  'razer huntsman v3 pro tkl 8khz':               { layout: 'TKL',  switchType: 'optical',     rapidTrigger: true, pollHz: 8000 },
  'razer huntsman mini':                          { layout: '60%',  switchType: 'optical',     rapidTrigger: false, pollHz: 1000 },
  'logitech g pro x keyboard':                    { layout: 'TKL',  switchType: 'mechanical',  rapidTrigger: false, pollHz: 1000 },
  'logitech g pro x tkl keyboard':                { layout: 'TKL',  switchType: 'mechanical',  rapidTrigger: false, pollHz: 1000 },
  'logitech g pro x tkl rapid':                   { layout: 'TKL',  switchType: 'hall-effect', rapidTrigger: true, pollHz: 8000 },
  'logitech g pro keyboard':                      { layout: 'TKL',  switchType: 'mechanical',  rapidTrigger: false, pollHz: 1000 },
  'logitech g pro x 60':                          { layout: '60%',  switchType: 'mechanical',  rapidTrigger: false, pollHz: 1000 },
  'logitech g715':                                { layout: 'TKL',  switchType: 'mechanical',  rapidTrigger: false, pollHz: 1000 },
  'logitech g915 tkl':                            { layout: 'TKL',  switchType: 'mechanical',  rapidTrigger: false, pollHz: 1000 },
  'steelseries apex pro tkl':                     { layout: 'TKL',  switchType: 'hall-effect', rapidTrigger: true, pollHz: 1000 },
  'steelseries apex pro mini':                    { layout: '60%',  switchType: 'hall-effect', rapidTrigger: true, pollHz: 1000 },
  'steelseries apex pro tkl gen 3':               { layout: 'TKL',  switchType: 'hall-effect', rapidTrigger: true, pollHz: 8000 },
  'asus rog falchion ace hfx':                    { layout: '65%',  switchType: 'hall-effect', rapidTrigger: true, pollHz: 8000 },
  'asus rog falchion ace 75 he':                  { layout: '75%',  switchType: 'hall-effect', rapidTrigger: true, pollHz: 8000 },
  'corsair k70 pro tkl':                          { layout: 'TKL',  switchType: 'hall-effect', rapidTrigger: true, pollHz: 8000 },
  'corsair k70 pro mini wireless':                { layout: '60%',  switchType: 'optical',     rapidTrigger: true, pollHz: 1000 },
  'ducky one 3 mini':                             { layout: '60%',  switchType: 'mechanical',  rapidTrigger: false, pollHz: 1000 },
  'ducky one 2 mini':                             { layout: '60%',  switchType: 'mechanical',  rapidTrigger: false, pollHz: 1000 },
  'pulsar pcmk 2 he tkl':                         { layout: 'TKL',  switchType: 'hall-effect', rapidTrigger: true, pollHz: 8000 },
  'iqunix ev63 he':                               { layout: '60%',  switchType: 'hall-effect', rapidTrigger: true, pollHz: 8000 },
  'akko mod 007 v3 he':                           { layout: '75%',  switchType: 'hall-effect', rapidTrigger: true, pollHz: 8000 },
  'realforce r2':                                 { layout: 'TKL',  switchType: 'mechanical',  rapidTrigger: false, pollHz: 1000 },
};

// ─── MONITOR SPECS ───────────────────────────────────────────────────────
export const MONITOR_SPECS: Record<string, MonitorSpec> = {
  'zowie xl2566k':                  { hz: 360, resolution: '1080p', panelType: 'TN',       responseMs: 0.5 },
  'zowie xl2566x+':                 { hz: 540, resolution: '1080p', panelType: 'Fast IPS', responseMs: 0.5 },
  'zowie xl2586x+':                 { hz: 540, resolution: '1080p', panelType: 'Fast IPS', responseMs: 0.5 },
  'zowie xl2586x':                  { hz: 540, resolution: '1080p', panelType: 'Fast IPS', responseMs: 0.5 },
  'zowie xl2546k':                  { hz: 240, resolution: '1080p', panelType: 'TN',       responseMs: 0.5 },
  'zowie xl2546x':                  { hz: 240, resolution: '1080p', panelType: 'Fast IPS', responseMs: 0.5 },
  'zowie xl2546':                   { hz: 240, resolution: '1080p', panelType: 'TN',       responseMs: 1 },
  'zowie xl2540k':                  { hz: 240, resolution: '1080p', panelType: 'TN',       responseMs: 1 },
  'zowie xl2540':                   { hz: 240, resolution: '1080p', panelType: 'TN',       responseMs: 1 },
  'zowie xl2540 divina':            { hz: 240, resolution: '1080p', panelType: 'TN',       responseMs: 1 },
  'zowie xl2411k':                  { hz: 144, resolution: '1080p', panelType: 'TN',       responseMs: 1 },
  'zowie xl2746s':                  { hz: 240, resolution: '1080p', panelType: 'TN',       responseMs: 0.5 },
  'sony inzone m10s':               { hz: 480, resolution: '1080p', panelType: 'OLED',     responseMs: 0.03 },
  'alienware aw2523hf':             { hz: 360, resolution: '1080p', panelType: 'Fast IPS', responseMs: 0.5 },
  'alienware aw2524hf':             { hz: 360, resolution: '1080p', panelType: 'Fast IPS', responseMs: 0.5 },
  'alienware aw2521h':              { hz: 360, resolution: '1080p', panelType: 'Fast IPS', responseMs: 1 },
  'alienware aw2521hf':             { hz: 240, resolution: '1080p', panelType: 'Fast IPS', responseMs: 1 },
  'asus tuf vg259qm':               { hz: 280, resolution: '1080p', panelType: 'Fast IPS', responseMs: 1 },
  'asus rog swift pg259qn':         { hz: 360, resolution: '1080p', panelType: 'Fast IPS', responseMs: 1 },
  'asus rog swift pg27aqn':         { hz: 360, resolution: '1440p', panelType: 'Fast IPS', responseMs: 1 },
  'asus rog swift pg258q':          { hz: 240, resolution: '1080p', panelType: 'TN',       responseMs: 1 },
  'lg ultragear 27gn950-b':         { hz: 144, resolution: '4k',    panelType: 'IPS',      responseMs: 1 },
  'lg ultragear 27gp850':           { hz: 165, resolution: '1440p', panelType: 'IPS',      responseMs: 1 },
  'lg ultragear 32gq950-b':         { hz: 144, resolution: '4k',    panelType: 'IPS',      responseMs: 1 },
  'samsung odyssey g7':             { hz: 240, resolution: '1440p', panelType: 'IPS',      responseMs: 1 },
  'omen by hp 25':                  { hz: 240, resolution: '1080p', panelType: 'TN',       responseMs: 1 },
  'gigabyte aorus fi25f':           { hz: 240, resolution: '1080p', panelType: 'IPS',      responseMs: 1 },
  'gigabyte m27q x':                { hz: 240, resolution: '1440p', panelType: 'IPS',      responseMs: 1 },
  'msi optix mag251rx':             { hz: 240, resolution: '1080p', panelType: 'IPS',      responseMs: 1 },
};

// ─── MOUSEPAD SPECS ──────────────────────────────────────────────────────
export const MOUSEPAD_SPECS: Record<string, MousepadSpec> = {
  'steelseries qck heavy':                  { friction: 'control', size: 'L',   surface: 'cloth' },
  'steelseries qck heavy xxl':              { friction: 'control', size: 'XXL', surface: 'cloth' },
  'steelseries qck':                        { friction: 'control', size: 'M',   surface: 'cloth' },
  'steelseries qck+':                       { friction: 'control', size: 'XL',  surface: 'cloth' },
  'steelseries qck large':                  { friction: 'control', size: 'XL',  surface: 'cloth' },
  'razer gigantus v2':                      { friction: 'control', size: 'XXL', surface: 'cloth' },
  'razer strider':                          { friction: 'hybrid',  size: 'XL',  surface: 'hybrid' },
  'razer atlas':                            { friction: 'speed',   size: 'L',   surface: 'hard' },
  'artisan ninja fx zero soft':             { friction: 'hybrid',  size: 'XL',  surface: 'cloth' },
  'artisan ninja fx zero xsoft':            { friction: 'control', size: 'XL',  surface: 'cloth' },
  'artisan ninja fx zero mid':              { friction: 'hybrid',  size: 'XL',  surface: 'cloth' },
  'artisan ninja fx hayate otsu':           { friction: 'speed',   size: 'XL',  surface: 'cloth' },
  'artisan hayate otsu soft':               { friction: 'hybrid',  size: 'XL',  surface: 'cloth' },
  'artisan hayate otsu xsoft':              { friction: 'control', size: 'XL',  surface: 'cloth' },
  'artisan hayate otsu mid':                { friction: 'hybrid',  size: 'XL',  surface: 'cloth' },
  'artisan fx hien soft':                   { friction: 'speed',   size: 'XL',  surface: 'cloth' },
  'artisan fx hien xsoft':                  { friction: 'hybrid',  size: 'XL',  surface: 'cloth' },
  'artisan fx hien mid':                    { friction: 'speed',   size: 'XL',  surface: 'cloth' },
  'artisan type-99 soft':                   { friction: 'control', size: 'XL',  surface: 'cloth' },
  'artisan type-99 xsoft':                  { friction: 'control', size: 'XL',  surface: 'cloth' },
  'artisan type-99 matcha':                 { friction: 'control', size: 'XL',  surface: 'cloth' },
  'artisan raiden fx soft':                 { friction: 'speed',   size: 'XL',  surface: 'cloth' },
  'artisan shidenkai v2 xsoft':             { friction: 'control', size: 'XL',  surface: 'cloth' },
  'zowie g-sr':                             { friction: 'control', size: 'L',   surface: 'cloth' },
  'zowie g-sr ii':                          { friction: 'control', size: 'L',   surface: 'cloth' },
  'zowie g-sr iii':                         { friction: 'control', size: 'L',   surface: 'cloth' },
  'zowie g-sr-se rouge':                    { friction: 'control', size: 'L',   surface: 'cloth' },
  'zowie g-sr-se rouge ii':                 { friction: 'control', size: 'L',   surface: 'cloth' },
  'zowie g-tr':                             { friction: 'hybrid',  size: 'L',   surface: 'cloth' },
  'zowie h-sr iii':                         { friction: 'hybrid',  size: 'L',   surface: 'cloth' },
  'logitech g640':                          { friction: 'control', size: 'L',   surface: 'cloth' },
  'logitech g740':                          { friction: 'control', size: 'L',   surface: 'cloth' },
  'logitech g840':                          { friction: 'control', size: 'XL',  surface: 'cloth' },
  'pulsar es saturn pro':                   { friction: 'hybrid',  size: 'XL',  surface: 'cloth' },
  'pulsar x lgg saturn pro':                { friction: 'hybrid',  size: 'XL',  surface: 'cloth' },
  'vaxee pa':                               { friction: 'hybrid',  size: 'XL',  surface: 'cloth' },
  'vaxee pb':                               { friction: 'control', size: 'XL',  surface: 'cloth' },
  'vaxee pe':                               { friction: 'speed',   size: 'XL',  surface: 'cloth' },
  'x-raypad aqua control plus':             { friction: 'control', size: 'XL',  surface: 'cloth' },
  'x-raypad equate':                        { friction: 'hybrid',  size: 'XL',  surface: 'cloth' },
  'wallhack sp-004':                        { friction: 'hybrid',  size: 'XL',  surface: 'cloth' },
  'lethal gaming gear saturn pro':          { friction: 'hybrid',  size: 'XL',  surface: 'cloth' },
};

// ─── Lookup helpers ──────────────────────────────────────────────────────
export function getMouseSpec(name: string): MouseSpec | undefined {
  return MOUSE_SPECS[normalizeGearKey(name)];
}
export function getKeyboardSpec(name: string): KeyboardSpec | undefined {
  return KEYBOARD_SPECS[normalizeGearKey(name)];
}
export function getMonitorSpec(name: string): MonitorSpec | undefined {
  return MONITOR_SPECS[normalizeGearKey(name)];
}
export function getMousepadSpec(name: string): MousepadSpec | undefined {
  return MOUSEPAD_SPECS[normalizeGearKey(name)];
}
