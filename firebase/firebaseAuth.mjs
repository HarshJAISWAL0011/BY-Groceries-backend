import { initializeApp } from 'firebase/app';
import dotenv from 'dotenv';
import { getAuth } from "firebase/auth";
dotenv.config();

export const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG)
export const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
