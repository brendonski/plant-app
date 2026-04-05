import type { Bed, IdbBed } from "$lib/types";
import { bedsCollection } from "$lib/db/collections";

// Helper to clone data and remove reactivity proxies
function clonePlain<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

class BedsStore {
  get beds(): Bed[] {
    const items = bedsCollection.find().fetch();
    return clonePlain(items);
  }

  add(bed: Omit<Bed, "id">) {
    const newBed: Bed = {
      id: crypto.randomUUID(),
      ...bed,
    };
    bedsCollection.insert(newBed);
  }

  update(id: string, updates: Partial<Omit<Bed, "id">>) {
    bedsCollection.updateOne({ id }, { $set: updates });
  }

  remove(id: string) {
    bedsCollection.removeOne({ id });
  }

  getById(id: string): Bed | undefined {
    const item = bedsCollection.findOne({ id });
    return item ? clonePlain(item) : undefined;
  }

  async migrateFromLocalStorage() {
    // Migration happens on app startup in +layout.ts
    // This method is kept for reference but migration logic is elsewhere
  }
}

export const bedsStore = new BedsStore();
