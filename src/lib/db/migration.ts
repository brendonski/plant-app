import { bedsCollection } from "./collections";
import { plantsCollection } from "./collections";
import type { Bed, Plant } from "$lib/types";

export async function migrateFromLocalStorage() {
  if (typeof window === "undefined") return;

  const migrationComplete = localStorage.getItem("opfs-migration-complete");
  if (migrationComplete === "true") {
    console.log("Migration already completed");
    return;
  }

  console.log("Starting migration from localStorage to OPFS...");

  try {
    // Migrate beds
    const bedsData = localStorage.getItem("beds");
    if (bedsData) {
      try {
        const beds = JSON.parse(bedsData) as Bed[];
        console.log(`Migrating ${beds.length} beds...`);
        beds.forEach((bed) => {
          if (!bedsCollection.findOne({ id: bed.id })) {
            bedsCollection.insert(bed);
          }
        });
      } catch (err) {
        console.error("Error migrating beds:", err);
      }
    }

    // Migrate plants
    const plantsData = localStorage.getItem("plants");
    if (plantsData) {
      try {
        const oldPlants = JSON.parse(plantsData) as Array<{
          id: string;
          name: string;
          dominantColour: string;
          photo: string | null;
          location: {
            bedId: string;
            row: number;
            position: number;
          };
        }>;
        console.log(`Migrating ${oldPlants.length} plants...`);
        oldPlants.forEach((oldPlant) => {
          if (!plantsCollection.findOne({ id: oldPlant.id })) {
            // Convert single photo to photos array
            const photos: string[] = [];
            if (oldPlant.photo) {
              photos.push(oldPlant.photo);
            }

            const newPlant: Plant = {
              id: oldPlant.id,
              name: oldPlant.name,
              dominantColour: oldPlant.dominantColour,
              photos,
              location: oldPlant.location,
            };
            plantsCollection.insert(newPlant);
          }
        });
      } catch (err) {
        console.error("Error migrating plants:", err);
      }
    }

    // Mark migration as complete
    localStorage.setItem("opfs-migration-complete", "true");
    console.log("Migration complete!");
  } catch (err) {
    console.error("Error during migration:", err);
  }
}
