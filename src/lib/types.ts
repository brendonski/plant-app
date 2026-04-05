export interface Bed {
  id: string;
  name: string;
  rows: number;
  positionsPerRow: number;
}

export interface PlantLocation {
  bedId: string;
  row: number;
  position: number;
}

export interface Plant {
  id: string;
  name: string;
  dominantColour: string;
  photos: string[];
  location: PlantLocation;
  notes?: string;
}

export interface IdbBed {
  id: string;
  name: string;
  rows: number;
  positionsPerRow: number;
}

export interface IdbPlantLocation {
  bedId: string;
  row: number;
  position: number;
}

export interface IdbPlant {
  id: string;
  name: string;
  dominantColour: string;
  secondaryColour?: string;
  photos: string[];
  location: IdbPlantLocation;
  notes?: string;
}
