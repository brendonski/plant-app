import type { Plant } from "$lib/types";
import { plantsCollection } from "$lib/db/collections";

// Helper to clone data and remove reactivity proxies
function clonePlain<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

class PlantsStore {
  get plants(): Plant[] {
    const items = plantsCollection.find().fetch();
    return clonePlain(items);
  }

  add(plant: Omit<Plant, "id">) {
    const newPlant: Plant = {
      id: crypto.randomUUID(),
      ...plant,
    };
    // Ensure data is fully serializable (no proxies or uncloneable objects)
    const serialized = JSON.parse(JSON.stringify(newPlant));
    plantsCollection.insert(serialized);
  }

  update(id: string, updates: Partial<Omit<Plant, "id">>) {
    // Ensure updates are fully serializable
    const serialized = JSON.parse(JSON.stringify(updates));
    plantsCollection.updateOne({ id }, { $set: serialized });
  }

  remove(id: string) {
    plantsCollection.removeOne({ id });
  }

  getById(id: string): Plant | undefined {
    const item = plantsCollection.findOne({ id });
    return item ? clonePlain(item) : undefined;
  }

  getByLocation(
    bedId: string,
    row: number,
    position: number,
  ): Plant | undefined {
    const item = plantsCollection.findOne({
      "location.bedId": bedId,
      "location.row": row,
      "location.position": position,
    });
    return item ? clonePlain(item) : undefined;
  }

  getByBed(bedId: string): Plant[] {
    const items = plantsCollection.find({ "location.bedId": bedId }).fetch();
    return clonePlain(items);
  }

  async migrateFromLocalStorage() {
    // Migration happens on app startup in +layout.ts
    // This method is kept for reference but migration logic is elsewhere
  }
}

export const plantsStore = new PlantsStore();
