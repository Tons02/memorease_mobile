// sql/deceasedData.js
import * as SQLite from "expo-sqlite";

async function getDb() {
  return SQLite.openDatabaseAsync("app.db");
}

export async function initDeceasedTable() {
  const db = await getDb();
  await db.execAsync(`
  CREATE TABLE deceased (
    id INTEGER PRIMARY KEY,
    fname TEXT,
    lname TEXT,
    mname TEXT,
    suffix TEXT,
    full_name TEXT,
    gender TEXT,
    birthday TEXT,
    death_date TEXT,
    death_certificate TEXT,
    lot_id INTEGER,
    lot_coordinates TEXT,
    lot_image TEXT,
    is_private INTEGER,
    visibility TEXT
  );
`);
}

export async function insertDeceasedData(items = []) {
  const db = await getDb();
  const stmt = await db.prepareAsync(
    `INSERT OR REPLACE INTO deceased
     (id, fname, lname, mname, suffix, full_name, gender, birthday, death_date, death_certificate, lot_id, lot_coordinates, lot_image, is_private, visibility)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  try {
    for (const item of items) {
      await stmt.executeAsync([
        item.id,
        item.fname ?? null,
        item.lname ?? null,
        item.mname ?? null,
        item.suffix ?? null,
        item.full_name ?? null,
        item.gender ?? null,
        item.birthday ?? null,
        item.death_date ?? null,
        item.death_certificate ?? null,
        item.lot_id ?? null,
        item.lot?.coordinates ? JSON.stringify(item.lot.coordinates) : null, // stringify array
        item.lot_image ?? null,
        item.is_private ?? 0,
        item.visibility ?? null,
      ]);
    }
  } finally {
    await stmt.finalizeAsync();
  }
}

export async function getDeceasedData() {
  const db = await getDb();
  const rows = await db.getAllAsync(`SELECT * FROM deceased`);
  return rows.map((row) => ({
    ...row,
    lot_coordinates: row.lot_coordinates
      ? JSON.parse(row.lot_coordinates)
      : null,
  }));
}

export const getAllDeceased = async () => {
  const db = await getDb();
  const rows = await db.getAllAsync("SELECT * FROM deceased");
  return rows.map((row) => ({
    ...row,
    lot_coordinates: row.lot_coordinates
      ? JSON.parse(row.lot_coordinates)
      : null,
  }));
};
