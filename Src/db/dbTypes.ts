import SQLite, { SQLiteDatabase } from "react-native-sqlite-storage";

const DatabaseName = 'dkasr';

let db: SQLiteDatabase | null = null;
export async function openDatabase() {
  if (db) return db;

  db = await SQLite.openDatabase({
    name: DatabaseName + ".db",
    location: "default",
  });

  return db;
}

