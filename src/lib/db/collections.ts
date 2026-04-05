import createIndexedDBAdapter from "@signaldb/indexeddb";
import createOPFSAdapter from "@signaldb/opfs";
import { Collection, createPersistenceAdapter } from "@signaldb/core";
import type { Bed, Plant, IdbBed, IdbPlant } from "$lib/types";
import svelteReactivityAdapter from "@signaldb/svelte";
import { browser } from "$app/environment";

function createLocalStoragePersistenceAdapter<T extends { id: string }>(
  key: string,
) {
  return createPersistenceAdapter<T, string>({
    async load() {
      if (!browser) {
        return { items: [] };
      }
      const data = localStorage.getItem(key);
      if (!data) {
        return { items: [] };
      }
      try {
        const items = JSON.parse(data) as T[];
        return { items };
      } catch {
        return { items: [] };
      }
    },
    async save(items: T[]) {
      if (!browser) {
        return;
      }
      localStorage.setItem(key, JSON.stringify(items));
    },
    async register() {
      // No-op for localStorage (no external changes to listen to)
    },
  });
}

export const bedsCollection = new Collection<Bed>({
  persistence: createOPFSAdapter("beds.json"),
  reactivity: svelteReactivityAdapter,
});

export const plantsCollection = new Collection<Plant>({
  persistence: createOPFSAdapter("plants.json"),
  reactivity: svelteReactivityAdapter,
});

export const idbBedsCollection = new Collection({
  persistence: createIndexedDBAdapter("beds"),
});

export const idbPlantsCollection = new Collection({
  persistence: createIndexedDBAdapter("plants"),
});

export const opfsBedsCollection = new Collection({
  persistence: createOPFSAdapter("beds.json"),
});

export const opfsPlantsCollection = new Collection({
  persistence: createOPFSAdapter("plants.json"),
});
