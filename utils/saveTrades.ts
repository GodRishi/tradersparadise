import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import { Trade } from "../types";

export const saveTradesToCloud = async (trades: Trade[]) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  const tradesRef = collection(db, "users", user.uid, "trades");

  for (const trade of trades) {
    await addDoc(tradesRef, trade);
  }
};
