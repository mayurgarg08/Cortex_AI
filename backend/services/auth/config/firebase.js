import { cert, initializeApp } from "firebase-admin";
import { readFileSync } from "fs";

// In hosted environments the key is provided as JSON in FIREBASE_SERVICE_ACCOUNT
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : JSON.parse(readFileSync(new URL("../serviceAccountKey.json", import.meta.url)));

export const app=initializeApp({
  credential: cert(serviceAccount)
});
