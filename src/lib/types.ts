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
	photo: string | null;
	location: PlantLocation;
}
