import type { IdbPlant, Plant } from "$lib/types";
import { plantsCollection, opfsPlantsCollection } from "$lib/db/collections";
import { saveToBlob } from "$lib/db/utils";

class PlantsStore {
  get plants(): Plant[] {
    return plantsCollection.find().fetch();
  }

  add(plant: Omit<Plant, "id">) {
    const newPlant: Plant = {
      id: crypto.randomUUID(),
      ...plant,
    };
    plantsCollection.insert(newPlant);
  }

  update(id: string, updates: Partial<Omit<Plant, "id">>) {
    plantsCollection.updateOne({ id }, { $set: updates });
  }

  remove(id: string) {
    plantsCollection.removeOne({ id });
  }

  getById(id: string): Plant | undefined {
    return plantsCollection.findOne({ id });
  }

  getByLocation(
    bedId: string,
    row: number,
    position: number,
  ): Plant | undefined {
    return plantsCollection.findOne({
      "location.bedId": bedId,
      "location.row": row,
      "location.position": position,
    });
  }

  getByBed(bedId: string): Plant[] {
    return plantsCollection.find({ "location.bedId": bedId }).fetch();
  }

  migrateToIdb() {
    console.log("Migrate plants");
    this.plants.forEach(async (item, index) => {
      console.log(item, index);
      let plantId = item.id;
      console.log(opfsPlantsCollection.find().fetch());
      if (!opfsPlantsCollection.findOne({ id: plantId })) {
        console.log("Plant", item.id, "not found");
        let photos = [];
        const { photo, ...itemWithoutPhoto } = item;
        if (photo) {
          photos.push(photo);
        }
        console.log("photos: ", photos);
        let p: IdbPlant = {
          photos: photos,
          ...itemWithoutPhoto,
        };
        console.log("plant to insert", p);
        opfsPlantsCollection.insert(p);
      }
    });
  }
}

export const plantsStore = new PlantsStore();
