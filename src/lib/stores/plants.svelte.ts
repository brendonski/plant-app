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
    // Separate fields to unset (undefined values) before serialization
    const fieldsToUnset: Record<string, true> = {};
    const fieldsToSet: any = {};
    
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) {
        fieldsToUnset[key] = true;
      } else {
        fieldsToSet[key] = value;
      }
    }
    
    // Serialize the fields to set
    const serialized = Object.keys(fieldsToSet).length > 0 
      ? JSON.parse(JSON.stringify(fieldsToSet)) 
      : {};
    
    // Build update query
    const updateQuery: any = {};
    if (Object.keys(serialized).length > 0) {
      updateQuery.$set = serialized;
    }
    if (Object.keys(fieldsToUnset).length > 0) {
      updateQuery.$unset = fieldsToUnset;
    }
    
    if (Object.keys(updateQuery).length > 0) {
      plantsCollection.updateOne({ id }, updateQuery);
    }
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
