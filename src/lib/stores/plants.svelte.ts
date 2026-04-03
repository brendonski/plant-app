import type { Plant } from '$lib/types';
import { plantsCollection } from '$lib/db/collections';

class PlantsStore {
	get plants(): Plant[] {
		return plantsCollection.find().fetch();
	}

	add(plant: Omit<Plant, 'id'>) {
		const newPlant: Plant = {
			id: crypto.randomUUID(),
			...plant
		};
		plantsCollection.insert(newPlant);
	}

	update(id: string, updates: Partial<Omit<Plant, 'id'>>) {
		plantsCollection.updateOne({ id }, { $set: updates });
	}

	remove(id: string) {
		plantsCollection.removeOne({ id });
	}

	getById(id: string): Plant | undefined {
		return plantsCollection.findOne({ id });
	}

	getByLocation(bedId: string, row: number, position: number): Plant | undefined {
		return plantsCollection.findOne({
			'location.bedId': bedId,
			'location.row': row,
			'location.position': position
		});
	}

	getByBed(bedId: string): Plant[] {
		return plantsCollection.find({ 'location.bedId': bedId }).fetch();
	}
}

export const plantsStore = new PlantsStore();
