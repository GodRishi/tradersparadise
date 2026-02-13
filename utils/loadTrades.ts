import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "./firebase";
import { Trade } from "../types";

export const loadTradesFromCloud = async (): Promise<Trade[]> => {
  const user = auth.currentUser;
  if (!user) return [];

  const tradesRef = collection(db, "users", user.uid, "trades");
  const snapshot = await getDocs(tradesRef);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Trade[];
};
