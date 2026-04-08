export interface GearSettings {
  mouse: string;
  keyboard: string;
  monitor: string;
  mousepad: string;
  dpi: number;
  sensitivity: number;
  game: string;
}

export interface ProGamer {
  id?: string;
  _rawName?: string;
  name: string;
  team: string;
  game: string;
  imageUrl?: string;
  teamLogoUrl?: string;
  profileUrl: string;
  gear: {
    mouse: string;
    keyboard: string;
    monitor: string;
    mousepad: string;
    controller?: string;
  };
  settings: {
    dpi: number;
    sensitivity: number;
    edpi: number;
  };
  source: string;
  updatedAt?: string;
}
