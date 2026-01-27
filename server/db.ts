import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set. Database operations will fail.");
}

const sql = neon(connectionString || "");

export const db = drizzle(sql, { schema });

// For serverless connections, we expose the sql instance for direct queries if needed
export const sqlQuery = sql;

export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1`;
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}
