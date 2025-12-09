// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Tus credenciales reales de "chipssaludables"
const firebaseConfig = {
  apiKey: "AIzaSyC14DEvDl0XZGaPRHneZZ5EKh-98HSuKRQ",
  authDomain: "chipssaludables-9cef2.firebaseapp.com",
  projectId: "chipssaludables-9cef2",
  storageBucket: "chipssaludables-9cef2.firebasestorage.app",
  messagingSenderId: "203078180218",
  appId: "1:203078180218:web:af4794f4760f436f960ac3",
  measurementId: "G-FKD0GVB74B"
};

// 1. Inicializamos la App
const app = initializeApp(firebaseConfig);

// 2. Exportamos la Base de Datos (db) y la Autenticación (auth)
// Esto es lo que usarán tus componentes para guardar y leer datos.
export const db = getFirestore(app);
export const auth = getAuth(app);