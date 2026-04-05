import type { Bed, IdbBed } from "$lib/types";
import { bedsCollection } from "$lib/db/collections";

class BedsStore {
  get beds(): Bed[] {
    return bedsCollection.find().fetch();
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
    return bedsCollection.findOne({ id });
  }

  async migrateFromLocalStorage() {
    // Migration happens on app startup in +layout.ts
    // This method is kept for reference but migration logic is elsewhere
  }
}

export const bedsStore = new BedsStore();
