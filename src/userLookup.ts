import { ObjectId } from "mongodb";

import { getDb } from "./db.js";

// The role stored on a person's account, or undefined if there is no
// such person.
export async function getUserRole(
  userId: string,
): Promise<string | undefined> {
  let id: ObjectId;
  try {
    id = new ObjectId(userId);
  } catch {
    return undefined;
  }

  const db = await getDb();
  const user = await db.collection("user").findOne({ _id: id });
  return user ? (user.role ?? "none") : undefined;
}
