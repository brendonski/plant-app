import type { Bed, IdbBed } from "$lib/types";
import {
  bedsCollection,
  idbBedsCollection,
  opfsBedsCollection,
} from "$lib/db/collections";

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

  migrateToIdb() {
    console.log("Migrate beds");
    this.beds.forEach((item, index) => {
      console.log(item, index);
      let bedId = item.id;
      console.log(opfsBedsCollection.find().fetch());
      if (!opfsBedsCollection.findOne({ id: bedId })) {
        console.log("Bed", item.id, "not found");
        let b: IdbBed = {
          ...item,
        };
        opfsBedsCollection.insert(b);
      }
    });
  }
}

export const bedsStore = new BedsStore();
