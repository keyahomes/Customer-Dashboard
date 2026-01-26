import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";


// Replace with the config you have in Firebase console if different
const firebaseConfig = {
  apiKey: "AIzaSyDR8n84jADSmHeLu_WEqCBlfQaJ6rgVHjw",
  authDomain: "customer-dashboard---atl.firebaseapp.com",
  projectId: "customer-dashboard---atl",
  storageBucket: "customer-dashboard---atl.firebasestorage.app",
  messagingSenderId: "109025851541",
  appId: "1:109025851541:web:cb67526f675ac70feb439c",
  measurementId: "G-XKLRJBE8C8",
  databaseURL: "https://customer-dashboard---atl-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export default app;