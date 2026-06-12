import { MongoClient, ObjectId } from "mongodb";

import { assertMongoEnv, mongoDbName, mongoUri } from "./env.js";

let clientPromise;

export { ObjectId };

export async function getMongoClient() {
  assertMongoEnv();

  if (!clientPromise) {
    clientPromise = new MongoClient(mongoUri()).connect();
  }

  return clientPromise;
}

export async function getDb() {
  const client = await getMongoClient();
  return client.db(mongoDbName());
}

export async function pingMongo() {
  const db = await getDb();
  await db.command({ ping: 1 });
  return db;
}

export async function ensureIndexes(db) {
  await Promise.all([
    db.collection("admins").createIndex({ email: 1 }, { unique: true }),
    db.collection("orders").createIndex({ created_at: -1 }),
    db.collection("orders").createIndex({ status: 1, priority: 1 }),
    db.collection("custom_card_models").createIndex({ collection_slug: 1, slug: 1 }),
    db.collection("custom_card_models").createIndex({ created_at: -1 }),
    db.collection("catalog_model_overrides").createIndex({ source_model_id: 1 }, { unique: true }),
    db.collection("catalog_model_overrides").createIndex({ collection_slug: 1 }),
    db.collection("catalog_assets").createIndex({ key: 1 }, { unique: true }),
    db.collection("catalog_assets").createIndex({ kind: 1, collection_slug: 1 }),
    db.collection("admin_login_attempts").createIndex({ key: 1 }, { unique: true }),
    db
      .collection("admin_login_attempts")
      .createIndex({ updated_at: 1 }, { expireAfterSeconds: 60 * 60 * 24 }),
    db.collection("public_order_attempts").createIndex({ key: 1 }, { unique: true }),
    db
      .collection("public_order_attempts")
      .createIndex({ updated_at: 1 }, { expireAfterSeconds: 60 * 60 * 24 }),
  ]);
}

export function toObjectId(id) {
  if (!ObjectId.isValid(id)) {
    const err = new Error("Invalid id.");
    err.statusCode = 400;
    err.publicMessage = "Invalid record id.";
    throw err;
  }
  return new ObjectId(id);
}
