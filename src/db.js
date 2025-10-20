import { openDB } from 'idb';

const DB_NAME = 'RecipeScanDB';
const STORE_NAME = 'recipes';
const DB_VERSION = 1;

async function initDB() {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        });
        store.createIndex('title', 'title', { unique: true });
      }
    },
  });
  return db;
}

export async function getAllRecipes() {
  const db = await initDB();
  return await db.getAll(STORE_NAME);
}

export async function getRecipeById(id) {
  const db = await initDB();
  return await db.get(STORE_NAME, id);
}

export async function addRecipe(recipe) {
  const db = await initDB();
  return await db.add(STORE_NAME, recipe);
}

export async function updateRecipe(recipe) {
  const db = await initDB();
  return await db.put(STORE_NAME, recipe);
}

export async function deleteRecipe(id) {
  const db = await initDB();
  return await db.delete(STORE_NAME, id);
}

export async function bulkImportRecipes(recipes, mode = 'add') {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    if (mode === 'overwrite') {
        await store.clear();
        console.log('Database cleared for overwrite.');
    }

    let addedCount = 0;
    let skippedCount = 0;

    for (const recipe of recipes) {
        // Ensure recipe has a title
        if (!recipe.title) {
            skippedCount++;
            continue;
        }

        // Check for duplicates by title
        const existing = await store.index('title').get(recipe.title);
        if (existing) {
            skippedCount++;
            continue;
        }
        
        // Remove id if it exists, so IndexedDB can auto-increment
        delete recipe.id; 
        await store.add(recipe);
        addedCount++;
    }

    await tx.done;
    return { addedCount, skippedCount };
}
